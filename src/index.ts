const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const axios = require("axios");

// get api key from .env file
require("dotenv").config();
const API_KEY = process.env.API_KEY;

// Define your GraphQL schema
const typeDefs = gql`
  type PlayerData {
    id: String!
    gameName: String!
    tagLine: String!
    profileIcon: String!
    summonerLevel: Int!
    matches: [String!]!
    puuid: String!
  }

  type Query {
    getPlayerData(gameName: String!, tagLine: String!): PlayerData
  }
  type Query {
    getMatchList(puuid: String!, matchId: String!): String!
  }
  type Match {
    duration: Int
    gameMode: String
    gameStartTimestamp: Float
    gameEndTimestamp: Float
    championName: String
    role: String
    kills: Int
    deaths: Int
    assists: Int
  }

  type Query {
    getMatchDetails(matchId: String!, puuid: String!): Match
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
        console.log("🚀 ~ file: index.ts:54 ~ puuid:", puuid);

        if (!puuid) {
          throw new Error("PUUID not found in the response");
        }

        // Second API request
        const summonerUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`;
        const summonerResponse = await axios.get(summonerUrl);
        const { id, profileIconId, summonerLevel } = summonerResponse.data;

        // Third API request to get the match list
        const matchesUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${API_KEY}`;
        const matchesResponse = await axios.get(matchesUrl);
        const matches = matchesResponse.data;

        // Construct the profile icon URL
        const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/14.17.1/img/profileicon/${profileIconId}.png`;

        // Return the required data
        return {
          id,
          gameName,
          tagLine,
          profileIcon: profileIconUrl,
          summonerLevel,
          matches, // Returning matches list
          puuid,
        };
      } catch (error) {
        console.error("Error:", error);
        throw new Error("Failed to fetch player data");
      }
    },
    getMatchList: async (
      parent: any,
      { puuid, matchId }: { puuid: string; matchId: string }
    ) => {
      try {
        console.log("🚀 ~ file: index.ts:90 ~ puuid:", puuid);
        // API request
        const matchUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`;
        const matchResponse = await axios.get(matchUrl);
        const matchData = matchResponse.data;

        // Return the required data
        return matchData;
      } catch (error) {
        console.error("Error:", error);
        throw new Error("Failed to fetch match data");
      }
    },
    getMatchDetails: async (_, { matchId, puuid }) => {
      try {
        const response = await axios.get(
          `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`
        );
        if (!response.data) {
          throw new Error("No data found");
        }

        const matchData = response.data;

        const participants = response.data.metadata.participants;
        console.log("🚀 ~ file: index.ts:116 ~ participants:", participants);
        console.log("🚀 ~ file: index.ts:118 ~ puuid:", puuid);
        console.log(
          "🚀 ~ file: index.ts:119 ~ participants.indexOf(puuid):",
          participants.indexOf(puuid)
        );
        const playerIndex = participants.indexOf(puuid);
        console.log("🚀 ~ file: index.ts:116 ~ playerIndex:", playerIndex);

        const info = matchData.info;
        const puuiData = info.participants[playerIndex];
        console.log("🚀 ~ file: index.ts:120 ~ puuiData:", puuiData);

        return {
          duration: info.duration,
          gameMode: info.gameMode,
          gameStartTimestamp: info.gameStartTimestamp,
          gameEndTimestamp: info.gameEndTimestamp,
          championName: puuiData.championName,
          role: puuiData.role,
          kills: puuiData.kills,
          deaths: puuiData.deaths,
          assists: puuiData.assists,
        };
      } catch (error) {
        console.error("Error fetching match details:", error);
        throw new Error("Unable to fetch match details");
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
