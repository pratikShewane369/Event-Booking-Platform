const Event = require("../models/Event");

// Get All Events
// exports.getAllEvents = async(req, res) => {
//     try {
//         const filters = {};

//         if(req.query.category) {
//             filters.category = req.query.category;
//         }
//         if(req.query.ticketPrice) {
//             filters.ticketPrice = req.query.ticketPrice;
//         }

//         const events = await Event.find(filters);
//         res.json(events);
//     } catch(err) {
//         res.status(500).json({error : err.message });
//     }
// };

exports.getAllEvents = async (req, res) => {
    try {

        const filters = {};

        // Existing Filters
        if (req.query.category) {
            filters.category = req.query.category;
        }

        if (req.query.ticketPrice) {
            filters.ticketPrice = Number(req.query.ticketPrice);
        }

        // Search Filter
        if (req.query.search) {
            filters.$or = [
                {
                    title: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                },
                {
                    location: {
                        $regex: req.query.search,
                        $options: "i"
                    }
                }
            ];
        }

        const events = await Event.find(filters).sort({ date: 1 });

        res.json(events);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

exports.getEventById = async(req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if(!event) {
            return res.status(404).json({ error : 'Event not Found'});
        }
        res.json(event);
    } catch(err){
        res.status(500).json({
            error : err.message
        })
    }
}

exports.createEvent = async(req, res) => {
    const {title, description, date, location, category, availableSeats, ticketPrice, image, createdBy} = req.body;
    try {
        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            availableSeats,
            ticketPrice,
            image,
            createdBy
        });
        res.status(201).json({event});
    } catch(err) {
        res.status(500).json({error : err.message});
    }
}

exports.updateEvent = async(req, res) => {
    const {title, description, date, location, category, availableSeats, ticketPrice, image, createdBy} = req.body;
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            location,
            category,
            availableSeats,
            ticketPrice,
            image,
            createdBy
        }, { new : true });
        if(!event) {
            return res.status(404).json({ error : "Event not found"});
        } 
        res.json(event);
    } catch(err) {
        res.status(500).json({error : err.message});
    }
}

exports.deleteEvent = async(req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if(!event) {
            return res.status(400).json({error : "Event Not Found"});
        }
        res.json({message : "Event deleted successfully"});
    } catch (err) {
        res.status(500).json({ error : err.message });
    }
}