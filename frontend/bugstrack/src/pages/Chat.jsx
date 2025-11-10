import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import { Button, Modal, Form, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faUsers,
  faSearch,
  faPlus,
  faPaperPlane,
  faEllipsisV,
  faEdit,
  faTrash,
  faUserPlus,
  faSignOutAlt,
  faImage,
  faPhone,
  faVideo,
  faPhoneSlash,
  faVideoSlash,
  faDesktop,
  faSmile,
  faReply,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import io from 'socket.io-client';

const RTC_CONFIGURATION = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const Chat = ({ isDarkMode = false, showNotification, currentUser, activeTab = 'chats', onTabChange }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Modals
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);

  // New chat/group data
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    selectedMembers: []
  });

  // Message features
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareTrackRef = useRef(null);
  const originalVideoTrackRef = useRef(null);
  const activeCallConversationRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const [callState, setCallState] = useState('idle'); // idle | calling | ringing | in-call
  const [incomingCall, setIncomingCall] = useState(null);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callMode, setCallMode] = useState('video'); // video | audio
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('message-received', (message) => {
      setMessages((prev) => [...prev, message]);
      fetchConversations(); // Update last message in sidebar
      scrollToBottom();
    });

    const offerHandler = (data) => handleIncomingOffer(data);
    const answerHandler = (data) => handleCallAnswer(data);
    const candidateHandler = (data) => handleRemoteCandidate(data);
    const callEndHandler = (data) => handleRemoteCallEnd(data);
    const callDeclineHandler = (data) => handleRemoteCallDeclined(data);

    socket.on('call-offer', offerHandler);
    socket.on('call-answer', answerHandler);
    socket.on('ice-candidate', candidateHandler);
    socket.on('call-end', callEndHandler);
    socket.on('call-decline', callDeclineHandler);

    return () => {
      socket.off('call-offer', offerHandler);
      socket.off('call-answer', answerHandler);
      socket.off('ice-candidate', candidateHandler);
      socket.off('call-end', callEndHandler);
      socket.off('call-decline', callDeclineHandler);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchAvailableUsers();
  }, [activeTab]);

  useEffect(() => {
    return () => {
      endCall(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      
      // Join conversation room
      if (socketRef.current) {
        socketRef.current.emit('join-conversation', selectedConversation._id);
      }

      return () => {
        // Leave conversation room on cleanup
        if (socketRef.current) {
          socketRef.current.emit('leave-conversation', selectedConversation._id);
        }
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (
      callState !== 'idle' &&
      selectedConversation &&
      activeCallConversationRef.current &&
      selectedConversation._id !== activeCallConversationRef.current
    ) {
      endCall(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cleanupLocalStreams = () => {
    if (screenShareTrackRef.current) {
      screenShareTrackRef.current.onended = null;
      screenShareTrackRef.current.stop();
      screenShareTrackRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setIsScreenSharing(false);
  };

  const cleanupPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    remoteStreamRef.current = null;
    setRemoteStream(null);

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const endCall = (notifyRemote = true) => {
    const conversationId = activeCallConversationRef.current;

    if (notifyRemote && conversationId && socketRef.current) {
      socketRef.current.emit('call-end', { conversationId });
    }

    cleanupLocalStreams();
    cleanupPeerConnection();
    setCallState('idle');
    setIncomingCall(null);
    setShowIncomingCallModal(false);
    setIsScreenSharing(false);
    originalVideoTrackRef.current = null;
    activeCallConversationRef.current = null;
    pendingCandidatesRef.current = [];
  };

  const createPeerConnection = (conversationId) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(RTC_CONFIGURATION);

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          conversationId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        endCall(false);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const reportMediaError = (err, requestedVideo) => {
    let message = 'Unable to access your microphone or camera.';
    if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
      message = requestedVideo
        ? 'Camera or microphone not found. Please connect a device and try again.'
        : 'Microphone not found. Please connect a microphone and try again.';
    } else if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
      message = 'Permission denied. Please allow access to your microphone/camera in the browser.';
    } else if (err?.name === 'NotReadableError') {
      message = 'Another application is using your microphone or camera. Please close it and try again.';
    }

    showNotification?.({
      type: 'error',
      message,
    });
  };

  const startLocalMedia = async (conversationId, includeVideo) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Media devices are not supported in this browser.');
    }

    cleanupLocalStreams();

    const baseConstraints = {
      audio: true,
      video: includeVideo ? { facingMode: 'user' } : false,
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(baseConstraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection(conversationId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (includeVideo) {
        originalVideoTrackRef.current = stream.getVideoTracks()[0] || null;
      } else {
        originalVideoTrackRef.current = null;
      }

      return stream;
    } catch (err) {
      // If video call requested but camera missing, fall back to audio-only
      const isDeviceMissing =
        err?.name === 'NotFoundError' ||
        err?.name === 'DevicesNotFoundError' ||
        err?.message?.includes('Requested device not found');

      if (includeVideo && isDeviceMissing) {
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          localStreamRef.current = audioOnlyStream;
          setLocalStream(audioOnlyStream);

          const pc = createPeerConnection(conversationId);
          audioOnlyStream.getTracks().forEach((track) => pc.addTrack(track, audioOnlyStream));

          originalVideoTrackRef.current = null;
          setCallMode('audio');
          showNotification?.({
            type: 'warning',
            message: 'Camera not found. Continuing with audio-only call.',
          });

          return audioOnlyStream;
        } catch (audioErr) {
          reportMediaError(audioErr, false);
          throw audioErr;
        }
      }

      reportMediaError(err, includeVideo);
      throw err;
    }
  };

  const startCall = async (includeVideo = true) => {
    if (!selectedConversation) {
      showNotification?.({
        type: 'warning',
        message: 'Select a conversation before starting a call.',
      });
      return;
    }

    if (callState !== 'idle') {
      showNotification?.({
        type: 'info',
        message: 'You are already in a call.',
      });
      return;
    }

    const conversationId = selectedConversation._id;

    try {
      setCallMode(includeVideo ? 'video' : 'audio');
      setCallState('calling');
      setIsScreenSharing(false);
      activeCallConversationRef.current = conversationId;
      pendingCandidatesRef.current = [];

      await startLocalMedia(conversationId, includeVideo);
      const pc = createPeerConnection(conversationId);
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: includeVideo });
      await pc.setLocalDescription(offer);

      socketRef.current?.emit('call-offer', {
        conversationId,
        offer,
        from: {
          id: currentUser?._id || currentUser?.id,
          name: currentUser?.name || 'Someone',
        },
        hasVideo: includeVideo,
      });
    } catch (err) {
      console.error('Error starting call:', err);
      showNotification?.({
        type: 'error',
        message: 'Unable to start the call. Please check your device permissions.',
      });
      endCall(false);
    }
  };

  const handleIncomingOffer = (data) => {
    if (callState !== 'idle') {
      socketRef.current?.emit('call-decline', {
        conversationId: data.conversationId,
        reason: 'busy',
      });
      return;
    }

    const targetConversation =
      selectedConversation && selectedConversation._id === data.conversationId
        ? selectedConversation
        : conversations.find((conv) => conv._id === data.conversationId);

    if (targetConversation && (!selectedConversation || selectedConversation._id !== targetConversation._id)) {
      setSelectedConversation(targetConversation);
    }

    setIncomingCall(data);
    setCallMode(data.hasVideo ? 'video' : 'audio');
    setShowIncomingCallModal(true);
    setCallState('ringing');
    pendingCandidatesRef.current = [];
  };

  const handleDeclineIncomingCall = (notifyRemote = true) => {
    if (notifyRemote && incomingCall) {
      socketRef.current?.emit('call-decline', {
        conversationId: incomingCall.conversationId,
        from: {
          id: currentUser?._id || currentUser?.id,
          name: currentUser?.name || 'You',
        },
      });
    }

    setIncomingCall(null);
    setShowIncomingCallModal(false);
    setCallState('idle');
    pendingCandidatesRef.current = [];
    activeCallConversationRef.current = null;
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;

    const conversationId = incomingCall.conversationId;

    try {
      activeCallConversationRef.current = conversationId;
      await startLocalMedia(conversationId, incomingCall.hasVideo);
      const pc = createPeerConnection(conversationId);
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      await flushPendingCandidates();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current?.emit('call-answer', {
        conversationId,
        answer,
        from: {
          id: currentUser?._id || currentUser?.id,
          name: currentUser?.name || 'You',
        },
      });

      setCallState('in-call');
    } catch (err) {
      console.error('Error accepting call:', err);
      showNotification?.({
        type: 'error',
        message: 'Unable to answer the call.',
      });
      endCall(false);
    } finally {
      setIncomingCall(null);
      setShowIncomingCallModal(false);
    }
  };

  const handleCallAnswer = async (data) => {
    if (!peerConnectionRef.current || !isActiveCallConversation(data.conversationId)) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      await flushPendingCandidates();
      setCallState('in-call');
    } catch (err) {
      console.error('Error handling call answer:', err);
    }
  };

  const flushPendingCandidates = async () => {
    if (!peerConnectionRef.current || pendingCandidatesRef.current.length === 0) return;

    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error flushing pending ICE candidates:', err);
      }
    }
  };

  const handleRemoteCandidate = async (data) => {
    if (!data.candidate) return;

    const isRelevant =
      isActiveCallConversation(data.conversationId) ||
      (incomingCall && incomingCall.conversationId === data.conversationId);

    if (!isRelevant) return;

    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('Error adding remote ICE candidate:', err);
      }
    } else {
      pendingCandidatesRef.current.push(data.candidate);
    }
  };

  const handleRemoteCallEnd = (data) => {
    if (incomingCall && incomingCall.conversationId === data.conversationId) {
      handleDeclineIncomingCall(false);
      showNotification?.({
        type: 'info',
        message: 'Call was cancelled.',
      });
      return;
    }

    if (!isActiveCallConversation(data.conversationId)) return;
    endCall(false);
    showNotification?.({
      type: 'info',
      message: 'Call ended.',
    });
  };

  const handleRemoteCallDeclined = (data) => {
    if (!isActiveCallConversation(data.conversationId)) return;
    endCall(false);
    showNotification?.({
      type: 'warning',
      message: 'Call was declined.',
    });
  };

  const startScreenShare = async () => {
    if (isScreenSharing || !peerConnectionRef.current) return;

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser.');
      }
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = displayStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        .getSenders()
        .find((s) => s.track && s.track.kind === 'video');

      if (sender && screenTrack) {
        screenShareTrackRef.current = screenTrack;
        await sender.replaceTrack(screenTrack);
        setIsScreenSharing(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };
      }
    } catch (err) {
      console.error('Error starting screen share:', err);
      showNotification?.({
        type: 'error',
        message: 'Unable to start screen sharing.',
      });
    }
  };

  const stopScreenShare = () => {
    const sender = peerConnectionRef.current
      ?.getSenders()
      .find((s) => s.track && s.track.kind === 'video');

    const originalTrack =
      localStreamRef.current?.getVideoTracks()[0] || originalVideoTrackRef.current || null;

    if (sender && originalTrack) {
      sender.replaceTrack(originalTrack);
    }

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    if (screenShareTrackRef.current) {
      screenShareTrackRef.current.onended = null;
      screenShareTrackRef.current.stop();
      screenShareTrackRef.current = null;
    }

    setIsScreenSharing(false);
  };

  const canInitiateCall = selectedConversation && callState === 'idle';

  const isActiveCallConversation = (conversationId) =>
    conversationId && activeCallConversationRef.current === conversationId;

  const startAudioCall = () => startCall(false);
  const startVideoCall = () => startCall(true);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const filtered = response.data.data.filter(conv => 
          activeTab === 'chats' ? conv.type === 'direct' : conv.type === 'group'
        );
        setConversations(filtered);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to fetch conversations'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (!silent) {
        showNotification?.({
          type: 'error',
          message: 'Failed to fetch messages'
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateDirectChat = async () => {
    if (!selectedUserId) {
      showNotification?.({
        type: 'error',
        message: 'Please select a user'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/conversations/direct',
        { participantId: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowNewChatModal(false);
        setSelectedUserId('');
        fetchConversations();
        setSelectedConversation(response.data.data);
        showNotification?.({
          type: 'success',
          message: response.data.exists ? 'Chat opened' : 'Chat created successfully!'
        });
      }
    } catch (err) {
      console.error('Error creating chat:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to create chat'
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name || groupForm.selectedMembers.length === 0) {
      showNotification?.({
        type: 'error',
        message: 'Please provide group name and select members'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/conversations/group',
        {
          name: groupForm.name,
          description: groupForm.description,
          participantIds: groupForm.selectedMembers
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowNewGroupModal(false);
        setGroupForm({ name: '', description: '', selectedMembers: [] });
        onTabChange?.('groups');
        fetchConversations();
        setSelectedConversation(response.data.data);
        showNotification?.({
          type: 'success',
          message: 'Group created successfully!'
        });
      }
    } catch (err) {
      console.error('Error creating group:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to create group'
      });
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        content: messageInput.trim(),
        replyTo: replyingTo?._id
      };

      const response = await axios.post(
        `http://localhost:5000/api/chat/conversations/${selectedConversation._id}/messages`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessageInput('');
        setReplyingTo(null);
        
        // Emit socket event for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit('new-message', {
            conversationId: selectedConversation._id,
            message: response.data.data
          });
        }
        
        // Add message to local state
        setMessages((prev) => [...prev, response.data.data]);
        fetchConversations(); // Update last message
      }
    } catch (err) {
      console.error('Error sending message:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to send message'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/chat/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification?.({
        type: 'success',
        message: 'Message deleted'
      });
      fetchMessages(selectedConversation._id, true);
    } catch (err) {
      console.error('Error deleting message:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to delete message'
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/chat/conversations/${selectedConversation._id}/leave`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification?.({
        type: 'success',
        message: 'Left group successfully'
      });
      setSelectedConversation(null);
      fetchConversations();
    } catch (err) {
      console.error('Error leaving group:', err);
      showNotification?.({
        type: 'error',
        message: 'Failed to leave group'
      });
    }
  };

  const getConversationName = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.name;
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.userId._id !== currentUser?.id && p.userId._id !== currentUser?._id
    );
    return otherParticipant?.userId.name || 'Unknown User';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.avatarUrl || null;
    }
    
    const otherParticipant = conversation.participants.find(
      p => p.userId._id !== currentUser?.id && p.userId._id !== currentUser?._id
    );
    return otherParticipant?.userId.avatarDataUrl || null;
  };

  const filteredConversations = conversations.filter(conv =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerClass = isDarkMode ? 'chat-container dark' : 'chat-container';

  return (
    <div className={containerClass}>
      {/* Main Chat Layout */}
      <div className="chat-layout">
        {/* Sidebar - Conversations List */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <Button
              className="new-chat-btn"
              onClick={() => activeTab === 'chats' ? setShowNewChatModal(true) : setShowNewGroupModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </div>

          <div className="conversations-list">
            {loading && conversations.length === 0 ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state">
                <p className="empty-icon">💬</p>
                <p className="empty-text">No {activeTab} yet</p>
                <p className="empty-subtext">
                  {activeTab === 'chats' ? 'Start a new conversation' : 'Create your first group'}
                </p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv._id}
                  className={`conversation-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {getConversationAvatar(conv) ? (
                      <img src={getConversationAvatar(conv)} alt="" />
                    ) : (
                      <div className="avatar-fallback">
                        {getConversationName(conv).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <span className="conversation-name">{getConversationName(conv)}</span>
                      {conv.lastMessage && (
                        <span className="conversation-time">
                          {new Date(conv.lastMessage.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    <div className="conversation-preview">
                      <span className="last-message">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  <div className="chat-avatar">
                    {getConversationAvatar(selectedConversation) ? (
                      <img src={getConversationAvatar(selectedConversation)} alt="" />
                    ) : (
                      <div className="avatar-fallback">
                        {getConversationName(selectedConversation).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="chat-title">{getConversationName(selectedConversation)}</h3>
                    {selectedConversation.type === 'group' && (
                      <p className="chat-subtitle">
                        {selectedConversation.participants.length} members
                      </p>
                    )}
                  </div>
                </div>
            <div className="chat-call-actions">
              <button
                className="call-action-btn"
                onClick={startAudioCall}
                disabled={!canInitiateCall}
                title="Start audio call"
              >
                <FontAwesomeIcon icon={faPhone} />
              </button>
              <button
                className="call-action-btn"
                onClick={startVideoCall}
                disabled={!canInitiateCall}
                title="Start video call"
              >
                <FontAwesomeIcon icon={faVideo} />
              </button>
              {callState !== 'idle' && callState !== 'ringing' && (
                <>
                  {callMode === 'video' && callState === 'in-call' && (
                    <button
                      className={`call-action-btn ${isScreenSharing ? 'active' : ''}`}
                      onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                      title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
                    >
                      <FontAwesomeIcon icon={isScreenSharing ? faVideoSlash : faDesktop} />
                    </button>
                  )}
                  <button
                    className="call-action-btn end"
                    onClick={() => endCall(true)}
                    title={callState === 'calling' ? 'Cancel call' : 'End call'}
                  >
                    <FontAwesomeIcon icon={faPhoneSlash} />
                  </button>
                </>
              )}
            </div>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" className="chat-menu-btn">
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {selectedConversation.type === 'group' && (
                      <>
                        <Dropdown.Item onClick={() => setShowGroupDetailsModal(true)}>
                          <FontAwesomeIcon icon={faUsers} /> Group Details
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleLeaveGroup}>
                          <FontAwesomeIcon icon={faSignOutAlt} /> Leave Group
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>

            {callState !== 'idle' && callState !== 'ringing' && (
              <div className="call-session">
                {callMode === 'video' ? (
                  <div className="call-video-grid">
                    <div className="video-tile remote">
                      <video ref={remoteVideoRef} autoPlay playsInline />
                      <span className="video-label">Remote</span>
                    </div>
                    <div className="video-tile local">
                      <video ref={localVideoRef} autoPlay playsInline muted />
                      <span className="video-label">You</span>
                    </div>
                  </div>
                ) : (
                  <div className="audio-call-banner">
                    <div className="audio-icon">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                    <div>
                      <h5>
                        {selectedConversation
                          ? getConversationName(selectedConversation)
                          : incomingCall?.from?.name || 'Audio Call'}
                      </h5>
                      <p>{callState === 'calling' ? 'Calling...' : callState === 'ringing' ? 'Incoming audio call...' : 'Connected'}</p>
                    </div>
                    <audio ref={remoteVideoRef} autoPlay />
                  </div>
                )}
              </div>
            )}

              {/* Messages Area */}
              <div className="messages-area">
                {messages.map((msg, index) => {
                  const isOwn = msg.sender._id === currentUser?.id || msg.sender._id === currentUser?._id;
                  const showAvatar = index === 0 || messages[index - 1].sender._id !== msg.sender._id;

                  return (
                    <div key={msg._id} className={`message-wrapper ${isOwn ? 'own' : ''}`}>
                      {!isOwn && showAvatar && (
                        <div className="message-avatar">
                          {msg.sender.avatarDataUrl ? (
                            <img src={msg.sender.avatarDataUrl} alt="" />
                          ) : (
                            <div className="avatar-fallback-small">
                              {msg.sender.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      {!isOwn && !showAvatar && <div className="message-avatar-spacer" />}
                      
                      <div className="message-content">
                        {!isOwn && showAvatar && (
                          <span className="message-sender">{msg.sender.name}</span>
                        )}
                        {msg.replyTo && (
                          <div className="message-reply-preview">
                            <FontAwesomeIcon icon={faReply} />
                            <span>Replying to a message</span>
                          </div>
                        )}
                        <div className="message-bubble">
                          <p className="message-text">{msg.content}</p>
                          {msg.isEdited && <span className="edited-label">(edited)</span>}
                        </div>
                        <div className="message-footer">
                          <span className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isOwn && (
                            <div className="message-actions">
                              <button
                                className="message-action-btn"
                                onClick={() => handleDeleteMessage(msg._id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          )}
                          {!isOwn && (
                            <button
                              className="message-action-btn"
                              onClick={() => setReplyingTo(msg)}
                            >
                              <FontAwesomeIcon icon={faReply} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="message-input-area">
                {replyingTo && (
                  <div className="replying-to-banner">
                    <FontAwesomeIcon icon={faReply} />
                    <span>Replying to {replyingTo.sender.name}</span>
                    <button onClick={() => setReplyingTo(null)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="message-input-form">
                  <input
                    ref={messageInputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="message-input"
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={!messageInput.trim() || sendingMessage}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        show={showIncomingCallModal}
        onHide={() => handleDeclineIncomingCall(true)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Incoming {incomingCall?.hasVideo ? 'Video' : 'Audio'} Call
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {incomingCall?.from?.name || 'Someone'} is calling you in{' '}
            {incomingCall?.hasVideo ? 'video' : 'audio'} mode.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleDeclineIncomingCall(true)}>
            Decline
          </Button>
          <Button variant="success" onClick={acceptIncomingCall}>
            Accept
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Chat Modal */}
      <Modal show={showNewChatModal} onHide={() => setShowNewChatModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Chat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select User</Form.Label>
            <Form.Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Choose a user...</option>
              {availableUsers
                .filter(u => u._id !== currentUser?.id && u._id !== currentUser?._id)
                .map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewChatModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateDirectChat}>
            Start Chat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Group Modal */}
      <Modal show={showNewGroupModal} onHide={() => setShowNewGroupModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Group Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter group description"
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Add Members *</Form.Label>
              <div className="member-selection">
                {availableUsers
                  .filter(u => u._id !== currentUser?.id && u._id !== currentUser?._id)
                  .map(user => (
                    <div key={user._id} className="member-checkbox">
                      <Form.Check
                        type="checkbox"
                        id={`user-${user._id}`}
                        label={`${user.name} (${user.email})`}
                        checked={groupForm.selectedMembers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroupForm({
                              ...groupForm,
                              selectedMembers: [...groupForm.selectedMembers, user._id]
                            });
                          } else {
                            setGroupForm({
                              ...groupForm,
                              selectedMembers: groupForm.selectedMembers.filter(id => id !== user._id)
                            });
                          }
                        }}
                      />
                    </div>
                  ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewGroupModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateGroup}>
            Create Group
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Chat;

