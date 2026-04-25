const Setting = require('../models/Setting');

const getExchangeRate = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "exchange_rate" });
    
    if (!setting) {
      return res.json({ success: true, data: { key: "exchange_rate", value: 0.0033 } });
    }
    
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateExchangeRate = async (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({ success: false, message: 'Value is required' });
    }
    
    const setting = await Setting.findOneAndUpdate(
      { key: "exchange_rate" },
      { 
        key: "exchange_rate",
        value: Number(value),
        updatedBy: req.user._id
      },
      { returnDocument: 'after', upsert: true }
    );
    
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStartingPoint = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: "starting_point" });
    if (!setting) {
      return res.json({ success: true, data: { name: "Deurumpitiya", lat: 6.8476, lng: 80.3647 } });
    }
    res.json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStartingPoint = async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'Name, lat, and lng are required' });
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }
    
    const setting = await Setting.findOneAndUpdate(
      { key: "starting_point" },
      { 
        key: "starting_point",
        value: { name, lat, lng },
        updatedBy: req.user._id
      },
      { returnDocument: 'after', upsert: true }
    );
    
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getExchangeRate,
  updateExchangeRate,
  getStartingPoint,
  updateStartingPoint
};
