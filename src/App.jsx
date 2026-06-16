import { useState } from "react";
import { Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import logo from "./assets/logo.png";

const initialLoginData = {
  email: "",
  password: "",
};

const initialRegisterData = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+63",
  phone: "",
  password: "",
  termsAccepted: false,
  marketingOptIn: false,
};

function App() {
  const [screen, setScreen] = useState("login");

  const [loginData, setLoginData] = useState(initialLoginData);
  const [registerData, setRegisterData] = useState(initialRegisterData);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [prize, setPrize] = useState("");
  const [spinning, setSpinning] = useState(false);

  const prizes = [
    "₱50 Voucher",
    "₱100 Voucher",
    "Free Coffee",
    "Better luck next time",
    "10% Discount",
    "Mystery Prize",
  ];

  function handleLoginChange(e) {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  }

  function handleRegisterChange(e) {
    const { name, value, type, checked } = e.target;
  
    setRegisterData({
      ...registerData,
      [name]: type === "checkbox" ? checked : value,
    });
  }
  
  function goToLogin() {
    setRegisterData(initialRegisterData);
    setShowRegisterPassword(false);
    setScreen("login");
  }
  
  function goToRegister() {
    setLoginData(initialLoginData);
    setShowLoginPassword(false);
    setScreen("register");
  }

  function handleLogin(e) {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      alert("Please enter your email and password.");
      return;
    }

    setCurrentUser({
      fullName: "Demo User",
      email: loginData.email,
    });

    setScreen("game");
  }

  function handleRegister(e) {
    e.preventDefault();
  
    if (
      !registerData.firstName ||
      !registerData.lastName ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.password
    ) {
      alert("Please fill in all required fields.");
      return;
    }
  
    if (!registerData.termsAccepted) {
      alert("You must accept the Terms and Conditions to continue.");
      return;
    }
  
    setCurrentUser({
      fullName: `${registerData.firstName} ${registerData.lastName}`,
      email: registerData.email,
      phone: `${registerData.countryCode}${registerData.phone}`,
      marketingOptIn: registerData.marketingOptIn,
    });
  
    setScreen("game");
  }

  function handleSpin() {
    setSpinning(true);
    setPrize("");

    setTimeout(() => {
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
      setPrize(randomPrize);
      setSpinning(false);
    }, 2000);
  }

  function handleLogout() {
    setCurrentUser(null);
    setLoginData(initialLoginData);
    setRegisterData(initialRegisterData);
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setPrize("");
    setSpinning(false);
    setScreen("login");
  }

  function getPasswordStrength(password) {
    let score = 0;
  
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
  
    if (!password) {
      return {
        label: "",
        width: "w-0",
        color: "bg-transparent",
        textColor: "text-transparent",
      };
    }
  
    if (score <= 2) {
      return {
        label: "Weak",
        width: "w-1/3",
        color: "bg-red-500",
        textColor: "text-red-500",
      };
    }
  
    if (score <= 4) {
      return {
        label: "Medium",
        width: "w-2/3",
        color: "bg-yellow-400",
        textColor: "text-yellow-500",
      };
    }
  
    return {
      label: "Strong",
      width: "w-full",
      color: "bg-green-500",
      textColor: "text-green-500",
    };
  }

  const passwordStrength = getPasswordStrength(registerData.password);

  return (
    <main className="flex items-center justify-center min-h-screen w-full font-lato bg-gradient-to-r from-[#f0e5ff] to-[#e0c8ff]">
      <div className="flex flex-col items-center justify-center min-w-md p-6 bg-white rounded-lg shadow-md">
        {screen === "login" && (
          <section className="flex flex-col items-center">
            <div className="flex flex-row items-center justify-center gap-1.75 my-2">
              <img src={logo} alt="Giftaway Logo" className="flex items-start w-45 mb-4" />
              <label className="text-3xl font-extrabold mb-4 text-[#a262f0]">Login</label>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col items-center w-xs mb-4">
              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md">
                <div className="flex items-center justify-center w-10 h-10 bg-[#a262f0]">
                  <Mail size={20} color="#ffffff" />
                </div>  
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full h-10 py-1 px-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md overflow-hidden">
                <div className="flex items-center justify-center w-10 h-10 bg-[#a262f0]">
                  <Lock size={20} color="#ffffff" />
                </div>

                <input
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full h-10 py-1 px-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="flex items-center justify-center w-10 h-10 text-[#a262f0] cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button 
                type="submit" 
                className="bg-[#a262f0] text-white font-bold w-full p-2 rounded-md cursor-pointer
                          hover:bg-[#8a4bd0] transition duration-300">Log In</button>
            </form>

            <p>
              No account yet?{" "}
              <button type="button" className="text-[#a262f0] font-bold cursor-pointer hover:text-[#8a4bd0] transition duration-300" onClick={goToRegister}>
                Register
              </button>
            </p>
          </section>
        )}

        {screen === "register" && (
          <section className="flex flex-col items-center w-md">
            <div className="flex flex-row items-center justify-center gap-1.75 my-2">
              <img src={logo} alt="Giftaway Logo" className="flex items-start w-45 mb-4" />
              <label className="text-3xl font-extrabold mb-4 text-[#a262f0]">Register</label>
            </div>
            <form onSubmit={handleRegister} className="flex flex-col items-center w-sm mb-4">
              <div className="flex flex-row gap-3 w-full mb-4">
                <div className="w-1/2 border-[#a262f0] border-2 rounded-md overflow-hidden">
                  <input
                    type="text"
                    name="firstName"
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                    className="w-full h-10 py-1 px-2 outline-none focus:outline-none focus:ring-0"
                    placeholder="First name"
                  />
                </div>

                <div className="w-1/2 border-[#a262f0] border-2 rounded-md overflow-hidden">
                  <input
                    type="text"
                    name="lastName"
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                    className="w-full h-10 py-1 px-2 outline-none focus:outline-none focus:ring-0"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md">
                <div className="flex items-center justify-center w-10 h-10 bg-[#a262f0]">
                  <Mail size={20} color="#ffffff" />
                </div> 
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="w-full h-10 py-1 px-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Enter your email"
                />
              </div>

              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md">
                <div className="flex items-center justify-center w-10 h-10 bg-[#a262f0]">
                  <Phone size={20} color="#ffffff" />
                </div> 
                <input
                  type="text"
                  name="phone"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  className="w-full h-10 py-1 px-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Phone number"
                />
              </div>  

              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md overflow-hidden">
                <div className="flex items-center justify-center w-10 h-10 bg-[#a262f0]">
                  <Lock size={20} color="#ffffff" />
                </div>

                <input
                  type={showRegisterPassword ? "text" : "password"}
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="w-full h-10 py-1 px-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="Create password"
                />

                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="flex items-center justify-center w-10 h-10 text-[#a262f0] cursor-pointer"
                >
                  {showRegisterPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="w-full mb-4">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.width} ${passwordStrength.color} transition-all duration-300`}
                  />
                </div>

                {registerData.password && (
                  <p className={`mt-1 text-sm font-semibold ${passwordStrength.textColor}`}>
                    Password strength: {passwordStrength.label}
                  </p>
                )}
              </div>

              <label className="flex items-start gap-2 w-full mb-3 text-sm">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={registerData.termsAccepted}
                  onChange={handleRegisterChange}
                  className="mt-1 h-4 w-4 accent-[#a262f0] cursor-pointer"
                />
                <span>
                  I agree to the Terms and Conditions and Privacy Policy.
                </span>
              </label>

              <label className="flex items-start gap-2 w-full mb-4 text-sm">
                <input
                  type="checkbox"
                  name="marketingOptIn"
                  checked={registerData.marketingOptIn}
                  onChange={handleRegisterChange}
                  className="mt-1 h-4 w-4 accent-[#a262f0] cursor-pointer"
                />
                <span>
                  I agree to receive updates, promos, and marketing emails.
                </span>
              </label>

              <button
                type="submit"
                className="bg-[#a262f0] text-white font-bold w-full p-2 rounded-md cursor-pointer hover:bg-[#8a4bd0] transition duration-300"
              >
                Register
              </button>
            </form>
            <p>
              Already have an account?{" "}
              <button type="button" className="text-[#a262f0] font-bold cursor-pointer hover:text-[#8a4bd0] transition duration-300" onClick={goToLogin}>
                Log In
              </button>
            </p>
          </section>
        )}

        {screen === "game" && (
          <section className="game-section">
            <header className="game-header">
              <div>
                <h1>Spin the Wheel</h1>
                <p>Welcome, {currentUser?.fullName}</p>
              </div>

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </header>

            <div className="wheel">
              {spinning ? "Spinning..." : prize || "Spin Me"}
            </div>

            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning || prize}
            >
              {spinning ? "Spinning..." : prize ? "Already Spun" : "Spin"}
            </button>

            {prize && (
              <p className="result">
                You won: <strong>{prize}</strong>
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default App;