const express = require("express");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt
} = require("graphql");
const expressGraphql = require("express-graphql");
const userData = require("./dummy/user.json");
const cityData = require("./dummy/city.json");
const genreData = require("./dummy/genre.json");
const monthData = require("./dummy/month.json");
const app = express();
const PORT = 5000;

app.listen(PORT, err => {
  if (err) throw err;
  console.log(`Server Running on port ${PORT}`);
});

// Type
const userType = new GraphQLObjectType({
  name: "Users",
  description: "List of all Users",
  fields: () => ({
    userId: { type: GraphQLInt },
    name: { type: GraphQLString },
    hobby: { type: GraphQLString }
  })
});

const cityType = new GraphQLObjectType({
  name: "Cities",
  description: "List of all City",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString }
  })
});

const genreType = new GraphQLObjectType({
  name: "Genres",
  description: "List of all Genre",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString }
  })
});

const monthType = new GraphQLObjectType({
  name: "Month",
  description: "List of all month",
  fields: () => ({
    genderId: { type: GraphQLInt },
    value: { type: GraphQLString }
  })
});

const detailType = new GraphQLObjectType({
  name: "Detail",
  description: "List of all Users",
  fields: () => ({
    userId: { type: GraphQLInt },
    name: { type: GraphQLString },
    hobby: { type: GraphQLString },
    monthOfBirth: {
      type: GraphQLString,
      resolve: (parent, args) => {
        const month = parent.userId
          .toString()
          .slice(6)
          .replace(0, "");
        const res = monthData.find(item => item.id == month);
        return res.name;
      }
    },
    gender: {
      type: GraphQLString,
      resolve: (parent, args) => {
        const genre = parent.userId.toString().slice(4, 6);
        const res = genreData.find(item => item.genderId == genre);
        return res.value;
      }
    },
    city: {
      type: GraphQLString,
      resolve: (parent, args) => {
        const city = parent.userId.toString().slice(0, 4);
        console.log(city);
        const res = cityData.find(item => item.id == city);
        return res.name;
      }
    }
  })
});

// Query
const rootQuery = new GraphQLObjectType({
  name: "RootQuery",
  description: "Query",
  fields: () => ({
    users: {
      type: GraphQLList(userType),
      description: "List of all Users",
      resolve: () => userData
    },
    cities: {
      type: GraphQLList(cityType),
      description: "List of all City",
      resolve: () => cityData
    },
    genres: {
      type: GraphQLList(genreType),
      description: "List of all Genre",
      resolve: () => genreData
    },
    month: {
      type: GraphQLList(monthType),
      description: "List of all Month",
      resolve: () => monthData
    },
    getDetails: {
      type: detailType,
      description: "Get detail of user",
      args: {
        userId: { type: GraphQLInt }
      },
      resolve: (parent, args) =>
        userData.find(user => user.userId == args.userId)
    }
  })
});

// Mutation
const rootMutation = new GraphQLObjectType({
  name: "Mutation",
  description: "add new data",
  fields: () => ({
    addUser: {
      type: userType,
      description: "Add new user",
      args: {
        name: { type: GraphQLString },
        hobby: { type: GraphQLString },
        monthOfBirth: { type: GraphQLString },
        gender: { type: GraphQLString },
        city: { type: GraphQLString }
      },
      resolve: (parent, args) => {
        const kota = cityData.find(city => city.name == args.city);
        const gender = args.gender;
        const monthOfBirth = args.monthOfBirth;
        const newUser = {
          userId: kota.id + gender + monthOfBirth,
          name: args.name,
          hobby: args.hobby
        };
        userData.push(newUser);
        return newUser;
      }
    },
    editUser: {
      type: userType,
      description: "Edit user data",
      args: {
        userId: { type: GraphQLInt },
        name: { type: GraphQLString },
        hobby: { type: GraphQLString }
      },
      resolve: (parent, args) => {
        let findUser = userData.find(user => user.userId == args.userId);
        if (args.name) {
          findUser.name = args.name;
        } else if (args.hobby) {
          findUser.hobby = args.hobby;
        }
        return findUser;
      }
    },
    deleteUser: {
      type: userType,
      description: "Delete user",
      args: {
        userId: { type: GraphQLInt }
      },
      resolve: (parent, args) => {
        let findUser = userData.findIndex(user => user.userId == args.userId);
        userData.splice(findUser, 1);
        return findUser;
      }
    }
  })
});

//schema
const schema = new GraphQLSchema({
  query: rootQuery,
  mutation: rootMutation
});

app.use(
  "/graphql",
  expressGraphql({
    schema: schema,

    graphiql: true
  })
);

// mutation{addUser(name:"yeris", hobby: "makan",gender:"10", monthOfBirth: "01", city:"bungul" ) {
//   userId
//   name
//   hobby
// }}
