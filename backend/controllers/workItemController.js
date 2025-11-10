const WorkItem = require('../models/WorkItem');
const User = require('../models/User');

// Admin/Dev: Create & assign work item
exports.createWorkItem = async (req,res) => {
  const { title, description, assignedTo, priority } = req.body;
  try {
    const user = await User.findById(assignedTo);
    if(!user) return res.status(404).json({ message: 'Assigned user not found' });

    const workItem = new WorkItem({
      title, description, assignedTo, priority,
      createdBy: req.user.id
    });
    await workItem.save();
    
    // Populate before returning
    await workItem.populate('assignedTo', 'name email role');
    await workItem.populate('createdBy', 'name email role');
    
    res.status(201).json(workItem);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Admin: get all work items
exports.getAllWorkItems = async (req,res) => {
  try {
    const workItems = await WorkItem.find()
      .populate('assignedTo','name email role')
      .populate('createdBy','name email role');
    res.json(workItems);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Dev/Tester: get my work items
exports.getMyWorkItems = async (req,res) => {
  try {
    console.log('=== GET MY WORK ITEMS DEBUG ===');
    console.log('User ID:', req.user.id);
    console.log('User ID Type:', typeof req.user.id);
    console.log('User Role:', req.user.role);
    console.log('User Email:', req.user.email);
    
    // Convert to string for comparison
    const userId = req.user.id.toString();
    
    const workItems = await WorkItem.find({ assignedTo: req.user.id })
      .populate('assignedTo','name email role')
      .populate('createdBy','name email role');
    console.log('Work Items Found:', workItems.length);
    
    // Also log all work items to debug
    const allItems = await WorkItem.find({})
      .populate('assignedTo','name email role')
      .populate('createdBy','name email role');
    console.log('Total Work Items in DB:', allItems.length);
    allItems.forEach(item => {
      console.log(`- Item: ${item.title}, AssignedTo ID: ${item.assignedTo._id.toString()}, User ID: ${userId}, Match: ${item.assignedTo._id.toString() === userId}`);
    });
    
    res.json(workItems);
  } catch(err) {
    console.error('Error in getMyWorkItems:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
}

// Admin/Dev: update work item (all fields)
exports.updateWorkItem = async (req, res) => {
  const { title, description, status, priority, assignedTo } = req.body;

  try {
    // Only Admin and Dev can update all fields
    if (!['Admin', 'Dev'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized. Only Admin and Dev can update work items.' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) {
      const user = await User.findById(assignedTo);
      if (!user) return res.status(404).json({ message: 'Assigned user not found' });
      updateData.assignedTo = assignedTo;
    }

    // ✅ This automatically returns the updated document
    let workItem = await WorkItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true, // return updated document
      runValidators: true, // ensure schema validation
    })
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    res.json(workItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// DELETE: /api/workitems/:id (Admin/Dev only)
exports.deleteWorkItem = async (req, res) => {
  try {
    // Only Admin and Dev can delete
    if (!['Admin', 'Dev'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized. Only Admin and Dev can delete work items.' });
    }

    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    await workItem.deleteOne(); // remove it
    res.json({ message: 'Work item deleted successfully', id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting work item' });
  }
};


// Dev/Tester/Admin: update status only
exports.updateWorkItemStatus = async (req,res) => {
  const { status } = req.body;
  try {
    let workItem = await WorkItem.findById(req.params.id);
    if(!workItem) return res.status(404).json({ message: 'Work item not found' });

    // Dev/Tester can only update their own work item
    if(req.user.role !== 'Admin' && workItem.assignedTo.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    workItem.status = status;
    await workItem.save();
    
    // Populate before returning
    await workItem.populate('assignedTo', 'name email role');
    await workItem.populate('createdBy', 'name email role');
    
    res.json(workItem);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Add a bug to a work item
exports.addBugToWorkItem = async (req, res) => {
  const { title, description, severity } = req.body;
  try {
    const workItem = await WorkItem.findById(req.params.id);
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    const newBug = {
      title,
      description,
      severity: severity || 'Medium',
      status: 'Open',
      createdBy: req.user.id,
      createdAt: new Date()
    };

    workItem.bugs.push(newBug);
    await workItem.save();

    // Populate before returning
    await workItem.populate('assignedTo', 'name email role avatarDataUrl');
    await workItem.populate('createdBy', 'name email role avatarDataUrl');
    await workItem.populate('bugs.createdBy', 'name email role avatarDataUrl');

    res.status(201).json(workItem);
  } catch (err) {
    console.error('Error adding bug:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a bug in a work item
exports.updateBug = async (req, res) => {
  const { workItemId, bugId } = req.params;
  const { title, description, severity, status } = req.body;

  try {
    const workItem = await WorkItem.findById(workItemId);
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    const bug = workItem.bugs.id(bugId);
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }

    // Update bug fields
    if (title !== undefined) bug.title = title;
    if (description !== undefined) bug.description = description;
    if (severity !== undefined) bug.severity = severity;
    if (status !== undefined) bug.status = status;

    await workItem.save();

    // Populate before returning
    await workItem.populate('assignedTo', 'name email role avatarDataUrl');
    await workItem.populate('createdBy', 'name email role avatarDataUrl');
    await workItem.populate('bugs.createdBy', 'name email role avatarDataUrl');

    res.json(workItem);
  } catch (err) {
    console.error('Error updating bug:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a bug from a work item
exports.deleteBug = async (req, res) => {
  const { workItemId, bugId } = req.params;

  try {
    const workItem = await WorkItem.findById(workItemId);
    if (!workItem) {
      return res.status(404).json({ message: 'Work item not found' });
    }

    const bug = workItem.bugs.id(bugId);
    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }

    bug.deleteOne();
    await workItem.save();

    // Populate before returning
    await workItem.populate('assignedTo', 'name email role avatarDataUrl');
    await workItem.populate('createdBy', 'name email role avatarDataUrl');
    await workItem.populate('bugs.createdBy', 'name email role avatarDataUrl');

    res.json(workItem);
  } catch (err) {
    console.error('Error deleting bug:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
