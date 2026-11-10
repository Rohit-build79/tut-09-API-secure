const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const SECRET = 'dev-secret-change-me';

// 1. Hardcoded Users (with hashed passwords)
const users = [
  { 
    id: 1, 
    email: 'asha@campus.edu', 
    role: 'customer', 
    hash: bcrypt.hashSync('customer123', 10) 
  },
  { 
    id: 2, 
    email: 'mealhub@campus.edu', 
    role: 'restaurant', 
    hash: bcrypt.hashSync('resto123', 10) 
  }
];

// Initial Items
let items = [
  { id: 1, name: 'Veg Thali', price: 90 },
  { id: 2, name: 'Paneer Roll', price: 70 }
];
let nextId = 3;

// 2. Login Route (Generates JWT Token)
app.post('/login', (req, res) => {
  const user = users.find(u => u.email === req.body.email);
  if (!user || !bcrypt.compareSync(req.body.password, user.hash)) {
    return res.status(401).json({ error: 'bad login' });
  }
  const token = jwt.sign(
    { sub: user.id, role: user.role }, 
    SECRET, 
    { expiresIn: '1h' }
  );
  res.json({ token });
});

// 3. Auth Middleware (Checks WHO you are)
function auth(req, res, next) {
  const token = (req.get('Authorization') || '').split(' ')[1];
  try { 
    req.user = jwt.verify(token, SECRET); 
    next(); 
  } catch { 
    res.status(401).json({ error: 'invalid or missing token' }); 
  }
}

// 4. RequireRole Middleware (Checks WHAT you can do)
function requireRole(...allowed) {
  return (req, res, next) => {
    if (allowed.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'forbidden' });
    }
  };
}

// 5. Routes
// GET /items - Standard authentication needed
app.get('/items', auth, (req, res) => res.json(items));

// POST /items - Requires 'restaurant' or 'admin' role
app.post('/items', auth, requireRole('restaurant', 'admin'), (req, res) => {
  const { name, price } = req.body;
  if (!name) return res.status(422).json({ error: 'name required' });
  const item = { id: nextId++, name, price: Number(price) || 0 };
  items.push(item);
  res.status(201).json(item);
});

// Server Listen
app.listen(3000, () => console.log('Secured Catalogue on http://localhost:3000'));


// const express = require('express');
// const app = express();

// app.get('/', (req, res) => {
//   res.send('Catalogue is alive');
// });

// app.listen(3000, () => console.log('on http://localhost:3000'));
// server.js
// const express = require('express');
// const app = express();

// app.use(express.json()); // Aage chal kar JSON requests read karne ke liye
// app.use(express.static('public')); // Frontend (HTML/CSS) serve karne ke liye

// // In-memory array (Tera menu data)
// // let items = [
// //   { id: 1, name: 'Veg Thali', price: 90 },
// //   { id: 2, name: 'Paneer Roll', price: 70 }
// // ];
// let items = [
//   { id: 1, name: 'Veg Thali', price: 90, veg: true },
//   { id: 2, name: 'Paneer Roll', price: 70, veg: true },
//   { id: 3, name: 'Chicken Roll', price: 100, veg: false } // Test ke liye ek non-veg dish
// ];
// let nextId = 4;


// // GET /items -- Pura menu wapas bhejne ke liye
// app.get('/items', (req, res) => {
//   res.json(items);
// });

// // GET /items/:id -- Koi ek dish ID se nikalne ke liye, ya 404 error dene ke liye
// // app.get('/items/:id', (req, res) => {
// //   // Jo ID URL me aayi hai usko number me convert karke array me dhundhna[cite: 2]
// //   const item = items.find(i => i.id === Number(req.params.id));
  
// //   // Agar dish nahi mili toh 404 Not Found error bhejna[cite: 2]
// //   if (!item) return res.status(404).json({ error: 'not found' });
  
// //   res.json(item);
// // });

// // GET /items -- Pura menu ya sirf veg menu bhejne ke liye
// app.get('/items', (req, res) => {
//   // Agar browser ne URL mein ?veg=true bheja hai[cite: 5]
//   if (req.query.veg === 'true') {
//     // Array me se sirf un items ko filter karo jinka veg status true hai
//     const vegDishes = items.filter(i => i.veg === true);
//     return res.json(vegDishes); 
//   }
  
//   // Agar koi query nahi aayi, toh pura menu (veg + non-veg) bhej do
//   res.json(items);
// });

// // POST /items -- Naya dish add karne ke liye
// app.post('/items', (req, res) => {
//   const { name, price } = req.body; // Client (yaani frontend) ne jo data bheja hai wo req.body me aayega[cite: 3]
  
//   // Agar kisi ne bina naam ke dish add karne ki koshish ki, toh 422 error denge[cite: 3]
//   if (!name) return res.status(422).json({ error: 'name required' });
  
//   // Ek naya item object bnao aur array me push kar do[cite: 3]
//   const item = { id: nextId++, name, price: Number(price) || 0 };
//   items.push(item);
  
//   // 201 Created status ke sath naya item wapas bhej do[cite: 3]
//   res.status(201).json(item);
// });
// // DELETE /items/:id -- Dish ko hatane ke liye
// app.delete('/items/:id', (req, res) => {
//   const id = Number(req.params.id);
//   const index = items.findIndex(i => i.id === id); // Array me dish dhundho
  
//   if (index === -1) return res.status(404).json({ error: 'not found' });
  
//   items.splice(index, 1); // Array se dish uda do
//   res.status(204).send(); // 204 ka matlab action successful raha par response me koi data nahi hai[cite: 5]
// });

// app.listen(3000, () => console.log('Catalogue on http://localhost:3000'));