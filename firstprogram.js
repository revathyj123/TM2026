var express = require("express");
var app = express();
const db = require("./database");
const nodemailer = require("nodemailer");
const ADMIN_PASSWORD = "NAT@2025"; // Change this to a strong password

//Add middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static("public"));

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/Pal', (req, res) => {
    res.render('Pal');
  });

  app.get("/aram", (req, res) => {
    const query = `
        SELECT a.id, a.athikaram_number, a.athikaram_name,
               CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS signed_up
        FROM athikaram a
        LEFT JOIN signups s ON a.id = s.athikaram_id
        WHERE a.athikaram_number < 39;
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.render('aram', { aram: rows });
    });
});

app.get("/porul", (req, res) => {
    const query = `
        SELECT a.id, a.athikaram_number, a.athikaram_name,
               CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS signed_up
        FROM athikaram a
        LEFT JOIN signups s ON a.id = s.athikaram_id
        WHERE a.athikaram_number BETWEEN 39 AND 108;
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.render('porul', { porul: rows });
    });
});

app.get("/inbam", (req, res) => {
    const query = `
        SELECT a.id, a.athikaram_number, a.athikaram_name,
               CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END AS signed_up
        FROM athikaram a
        LEFT JOIN signups s ON a.id = s.athikaram_id
        WHERE a.athikaram_number > 108;
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.render('inbam', { inbam: rows });
    });
});

app.get("/signup/:id", (req, res) => {
  const athikaramId = req.params.id;
  db.get(
    "SELECT id, athikaram_number, athikaram_name FROM athikaram WHERE id = ?",
    [athikaramId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.render("signup", { athikaram: row });
    }
  );
});

// Handle form submission
app.post("/signup", (req, res) => {
  const { athikaram_id, name, email, phone } = req.body;
  const insertQuery =
    "INSERT INTO signups (athikaram_id, name, email, phone, signup_date) VALUES (?, ?, ?, ?, datetime('now'))";

  db.run(insertQuery, [athikaram_id, name, email, phone], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Fetch athikaram_name after successful signup
    const selectQuery = "SELECT athikaram_name FROM athikaram WHERE id = ?";
    db.get(selectQuery, [athikaram_id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Send Confirmation Email
      sendConfirmationEmail(name, email, row.athikaram_name);

      // Render Confirmation Page
      res.render("confirmation", { athikaram_name: row.athikaram_name });
    });
  });
});

// Function to send confirmation email
function sendConfirmationEmail(name, email, athikaram_name) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sendmailtomurali@gmail.com",
      pass: "zqdy ftlz nhoy lekn", // Make sure to use an App Password
    },
  });

  const mailOptions = {
    from: '"Thirukurral Mutrothal" <sendmailtomurali@gmail.com>',
    to: email,
    subject: "Signup Confirmation",
    text: `Hello ${name},\n\nThank you for signing up for Athikaram ${athikaram_name}!\n\nBest regards,\nNA Thirukurral Mutrothal Team`,
    html: `<p>Hello <strong>${name}</strong>,</p><p>Thank you for signing up for <strong>Athikaram ${athikaram_name}</strong>!</p><p>Best regards,<br>NA Thirukurral Mutrothal Team</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

app.get("/admin/signups", (req, res) => {
  const password = req.query.password;

  if (password !== ADMIN_PASSWORD) {
      return res.status(403).send("Access Denied: Incorrect Password");
  }

  const query = `
      SELECT s.id, s.name, s.email, s.phone, a.athikaram_number, a.athikaram_name,
      strftime('%Y-%m-%d %H:%M:%S', s.signup_date, 'localtime') AS signup_date  
      FROM signups s
      JOIN athikaram a ON s.athikaram_id = a.id
      ORDER BY s.signup_date DESC;
  `;

  db.all(query, [], (err, rows) => {
      if (err) {
          res.status(500).json({ error: err.message });
          return;
      }
      res.render("signups", { signups: rows });
  });
});


// Confirmation Page Route
app.get("/confirmation", (req, res) => {
  res.render("confirmation");
});

// Start Server
var server = app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
