import Contact from '../models/Contact.js';

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
export const getContacts = async (req, res, next) => {
  try {
    let query = {};

    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const contacts = await Contact.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
export const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('createdBy', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
export const createContact = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    const contact = await Contact.create(req.body);

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
export const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import multiple contacts
// @route   POST /api/contacts/import
// @access  Private
export const importContacts = async (req, res, next) => {
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of contacts',
      });
    }

    // Add createdBy to all contacts
    const contactsWithCreator = contacts.map((contact) => ({
      ...contact,
      createdBy: req.user.id,
    }));

    const importedContacts = await Contact.insertMany(contactsWithCreator);

    res.status(201).json({
      success: true,
      count: importedContacts.length,
      data: importedContacts,
    });
  } catch (error) {
    next(error);
  }
};
