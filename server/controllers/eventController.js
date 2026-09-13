const Event = require('../models/Event'); // adjust path to your model
const { redisClient } = require('../config/redisClient');

exports.getAllEvents = async (req, res) => {
  try {
    console.log("Hit DB")
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event Not Found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);

    try {
      const keys = await redisClient.keys("events_list:*");
      if (keys.length) await redisClient.del(keys);
    } catch (cacheErr) {
      console.error("Cache invalidation failed:", cacheErr);
    }

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event Not Found" });
    }

    try {
      await redisClient.del(`event_detail:/api/events/${req.params.id}`);
      const keys = await redisClient.keys("events_list:*");
      if (keys.length) await redisClient.del(keys);
    } catch (cacheErr) {
      console.error("Cache invalidation failed:", cacheErr);
    }

    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(400).json({ error: "Event Not Found" });
    }

    try {
      await redisClient.del(`event_detail:/api/events/${req.params.id}`);
      const keys = await redisClient.keys("events_list:*");
      if (keys.length) await redisClient.del(keys);
    } catch (cacheErr) {
      console.error("Cache invalidation failed:", cacheErr);
    }

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};