const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

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
        
            dev = await Dev.create({
                github_username,
                name,
                avatar_url,
                bio,
                techs: techsArray,
                location,
            })

            //Filtrar as conexões que estão há no máximo 10 KM de distância
            // e que o novo tenha pelo menos uma das tecnologias filtradas.

            const sendSocketMessageTo = findConnections(
                { latitude, longitude},
                techsArray,
            )

            sendMessage(sendSocketMessageTo, 'new-dev', dev);
        }          

        return response.json(dev);
    },

    async update(request, response) {
        //Atualiza apenas Nome e Bio
        const { github_username, name, bio, techs } = request.body;

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