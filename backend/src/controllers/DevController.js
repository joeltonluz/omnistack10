const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');

module.exports = {
    async index(request, response) {
        const devs = await Dev.find();

        return response.json(devs);
    },

    async store(request, response) {
        const { github_username, techs, latitude, longitude } = request.body; //Destruturação para pegar a informação do request body.

        let dev = await Dev.findOne({ github_username });

        if (!dev) {
            const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);
            
            const { name = login, avatar_url, bio } = apiResponse.data;
        
            const techsArray = parseStringAsArray(techs);
        
            const location = {
                type: 'Point',
                coordinates: [longitude, latitude],
            };
        
            const dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            });
       }  
        
        return response.json(dev);
    },

    async update(request, response) {
        //Atualiza apenas Nome e Bio
        const { github_username, name, bio, techs } = request.query;

        const techsArray = parseStringAsArray(techs);

        let dev = await Dev.findOne({ github_username });

        if (dev) {
            const dev = await Dev.updateOne({ github_username}, {$set: {name, bio, techs: techsArray}});
        }
        return response.json(dev);
    },

    async destroy(request, response) {
        const { github_username } = request.query;
        
        const dev = await Dev.findOneAndDelete({ github_username });

        return response.json(dev);
    },
};