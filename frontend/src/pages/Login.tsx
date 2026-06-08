import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Warehouse, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Form validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(data.email, data.password);
      // Redirect to dashboard on successful login
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card rounded-card border border-border shadow-minimal p-8">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary-accent/10 text-primary-accent mb-4">
          <Warehouse className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">NexStock</h1>
        <p className="text-sm text-secondary mt-1.5">
          Sign in to the Warehouse Intelligence Platform
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-primary mb-2" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={`block w-full pl-10 pr-4 py-2.5 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
                errors.email ? "border-error" : "border-border"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-error mt-1.5 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`block w-full pl-10 pr-10 py-2.5 bg-background border rounded-card text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all duration-200 ${
                errors.password ? "border-error" : "border-border"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-error mt-1.5 font-medium">{errors.password.message}</p>
          )}
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-card bg-error/5 border border-error/20 text-sm text-error font-medium">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-card text-sm font-semibold text-white bg-primary-accent hover:bg-primary-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}
