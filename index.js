const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.ll4tlqm.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const toysCollection = client.db("toyCars").collection("toys");

    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.get("/my-toys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {sellerEmail: req.query.email};
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedToy = req.body;
      const toyUpdate = {
        $set: {
          price: updatedToy.price,
          availableQuantity: updatedToy.availableQuantity,
          detailsDescription: updatedToy.detailsDescription,
        },
      };
      const result = await toysCollection.updateOne(filter, toyUpdate, options);
      res.send(result);
    });

    app.delete("/my-toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ping: 1});
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Toy Marketplace Server Is Working");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
