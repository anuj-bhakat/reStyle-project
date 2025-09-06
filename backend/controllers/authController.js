import { signup, login } from '../services/authService.js';

export const signupController = async (req, res) => {
  try {
    const result = await signup(req.body);
    // Immediately log the user in
    const loginResult = await login(result.email, req.body.password);
    res.status(201).json({
      message: 'Signup successful',
      id: result.id,
      email: result.email,
      token: loginResult.token, 
    });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    const result = await login(email, password);
    res.json({ message: 'Login successful', ...result });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
