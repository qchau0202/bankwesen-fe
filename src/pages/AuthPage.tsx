import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "Login to Bankwesen" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? "Sign in to your account to continue" 
              : "Enter your details to create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? <LoginForm /> : <RegisterForm onToggle={() => setIsLogin(true)} />}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button
              variant="link"
              className="p-0 font-semibold cursor-pointer"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Register" : "Login"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Check if user exists
    const user = users.find((u: any) => u.email === formData.email && u.password === formData.password);
    
    if (user) {
      // Store current user in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));
      toast.success("Welcome back!");
      navigate("/home");
    } else {
      toast.error("Invalid email or password");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-xs font-semibold cursor-pointer"
          >
            Forgot password?
          </Button>
        </div>
        <Input
          id="login-password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" className="w-full font-bold cursor-pointer">
        Sign In
      </Button>
    </form>
  );
};

const RegisterForm = ({ onToggle }: { onToggle: () => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Check if email already exists
    if (users.some((u: any) => u.email === formData.email)) {
      toast.error("Email already registered!");
      return;
    }
    
    // Add new user
    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
    };
    
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    
    toast.success("Account created successfully!");
    onToggle();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Full Name</Label>
        <Input
          id="register-name"
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">Confirm Password</Label>
        <Input
          id="register-confirm-password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" className="w-full font-bold cursor-pointer">
        Create Account
      </Button>
    </form>
  );
};

export default AuthPage;