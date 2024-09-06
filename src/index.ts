const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const axios = require("axios");

const API_KEY = "RGAPI-74c49b71-9493-41c7-b9ac-95b22e5bd50d";

// Define your GraphQL schema
const typeDefs = gql`
  type PlayerData {
    id: String!
    gameName: String!
    tagLine: String!
    profileIcon: String!
    summonerLevel: Int!
  }

  type Query {
    getPlayerData(gameName: String!, tagLine: String!): PlayerData
  }
`;

// Implement the resolvers
const resolvers = {
  Query: {
    getPlayerData: async (
      _: any,
      { gameName, tagLine }: { gameName: string; tagLine: string }
    ) => {
      try {
        // First API request
        const riotIdUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`;
        const riotIdResponse = await axios.get(riotIdUrl);
        const { puuid } = riotIdResponse.data;

        if (!puuid) {
          throw new Error("PUUID not found in the response");
        }

        // Second API request
        const summonerUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`;
        const summonerResponse = await axios.get(summonerUrl);
        const { id, profileIconId, summonerLevel } = summonerResponse.data;

        // Construct the profile icon URL
        const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/profileicon/${profileIconId}.png`;

        // Return the required data
        return {
          id,
          gameName,
          tagLine,
          profileIcon: profileIconUrl,
          summonerLevel,
        };
      } catch (error) {
        console.error("Error:", error);
        throw new Error("Failed to fetch player data");
      }
    },
  },
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(
      `Server is running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
