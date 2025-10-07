const bcrypt = require('bcryptjs');
const supabase = require('../config/db.config');

// Trong hàm login (async):
const login = async (req, res) => {
    const { username, password } = req.body;
    const { data: user, error } = await supabase.from('users').select('*').eq('username', username).single();
    if (error || !user) return res.status(401).json({ message: 'Invalid credentials' });

    const validPw = await bcrypt.compare(password, user.password);
    if (!validPw) return res.status(401).json({ message: 'Invalid credentials' });

    // Sử dụng Supabase auth để lấy token (giả sử username là email hoặc ánh xạ)
    const { data: { session }, error: sessionError } = await supabase.auth.signInWithPassword({
        email: `${username}@example.com`, // Điều chỉnh nếu dùng email thật
        password
    });
    if (sessionError) throw sessionError;

    res.json({ token: session.access_token });
};

// Tương tự cho register: hash password rồi insert vào 'users', sau dùng supabase.auth.signUp nếu cần.