const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || "mongodb+srv://electro:electro123@cluster0.mongodb.net/electro?retryWrites=true&w=majority";

// Получить все пункты самовывоза
router.get('/', async (req, res) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('electro');
    const collection = database.collection('pickup_points');
    
    const pickupPoints = await collection.find({}).toArray();
    
    await client.close();
    
    res.json(pickupPoints);
  } catch (error) {
    console.error('Ошибка при получении пунктов самовывоза:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить новый пункт самовывоза
router.post('/', async (req, res) => {
  try {
    const { address, description, workingHours } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Адрес обязателен' });
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('electro');
    const collection = database.collection('pickup_points');
    
    const newPickupPoint = {
      address,
      description: description || '',
      workingHours: workingHours || 'Пн-Пт: 9:00-18:00',
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(newPickupPoint);
    
    await client.close();
    
    res.status(201).json({ 
      message: 'Пункт самовывоза добавлен',
      id: result.insertedId 
    });
  } catch (error) {
    console.error('Ошибка при добавлении пункта самовывоза:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить пункт самовывоза
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { address, description, workingHours } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Адрес обязателен' });
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('electro');
    const collection = database.collection('pickup_points');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          address, 
          description: description || '',
          workingHours: workingHours || 'Пн-Пт: 9:00-18:00',
          updatedAt: new Date()
        } 
      }
    );
    
    await client.close();
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Пункт самовывоза не найден' });
    }
    
    res.json({ message: 'Пункт самовывоза обновлен' });
  } catch (error) {
    console.error('Ошибка при обновлении пункта самовывоза:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить пункт самовывоза
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const database = client.db('electro');
    const collection = database.collection('pickup_points');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    await client.close();
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Пункт самовывоза не найден' });
    }
    
    res.json({ message: 'Пункт самовывоза удален' });
  } catch (error) {
    console.error('Ошибка при удалении пункта самовывоза:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 