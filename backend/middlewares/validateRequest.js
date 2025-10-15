// Request validation middleware
exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email',
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }

  next();
};

exports.validateCourse = (req, res, next) => {
  const { title, description, instructor, category, price, duration } = req.body;

  if (!title || !description || !instructor || !category || price === undefined || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required course fields',
    });
  }

  if (price < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price cannot be negative',
    });
  }

  next();
};
