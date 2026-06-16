import { supabase } from "./lib/supabaseClient";
import { useEffect, useState } from "react";
import { Mail, Frown, Lock, Eye, EyeOff, Coffee, Gift } from "lucide-react";
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

  const [authMessage, setAuthMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [currentUser, setCurrentUser] = useState(null);
  const [prize, setPrize] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [spinError, setSpinError] = useState("");

  const [wheelRotation, setWheelRotation] = useState(0);

  const prizes = [
    { label: "P 100", result: "₱100 eGift Voucher", color: "#faae34", icon: null },
    { label: "Coffee", result: "Coffee Voucher", color: "#ebd036", icon: "coffee" },
    { label: "10 %", result: "10% Discount Voucher", color: "#4dd6b8", icon: null },
    { label: "Gift", result: "Gift Card Voucher", color: "#60c2ef", icon: "gift" },
    { label: "P 50", result: "₱50 eGift Voucher", color: "#8c98fe", icon: null },
    { label: "Frown", result: "Better luck next time", color: "#fc897e", icon: "frown" },
  ];
  
  const segmentAngle = 360 / prizes.length;
  
  const wheelBackground = `conic-gradient(${prizes
    .map(
      (prize, index) =>
        `${prize.color} ${index * segmentAngle}deg ${
          (index + 1) * segmentAngle
        }deg`
    )
    .join(", ")})`;

  function handleLoginChange(e) {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });

    setLoginError("");
    setAuthMessage("");
  }

  function handleRegisterChange(e) {
    const { name, value, type, checked } = e.target;

    const newValue =
      type === "checkbox"
        ? checked
        : name === "phone"
        ? value.replace(/\D/g, "").slice(0, 10)
        : value;

    setRegisterData({
      ...registerData,
      [name]: newValue,
    });

    setRegisterError("");
  }

  function goToLogin(message = "") {
    setRegisterData(initialRegisterData);
    setRegisterError("");
    setShowRegisterPassword(false);
    setAuthLoading(false);
    setAuthMessage(message);
    setScreen("login");
  }

  function goToRegister() {
    setLoginData(initialLoginData);
    setLoginError("");
    setAuthMessage("");
    setShowLoginPassword(false);
    setAuthLoading(false);
    setScreen("register");
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePHPhoneNumber(phone) {
    const cleanedPhone = phone.replace(/\D/g, "");
    return /^9\d{9}$/.test(cleanedPhone);
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

  function setUserFromSession(user) {
    setCurrentUser({
      fullName: `${user.user_metadata?.firstName || "Demo"} ${
        user.user_metadata?.lastName || "User"
      }`,
      email: user.email,
      phone: user.user_metadata?.phone,
      marketingOptIn: user.user_metadata?.marketingOptIn,
    });
  }

  async function loadExistingSpinResult(userId) {
    const { data, error } = await supabase
      .from("spin_results")
      .select("prize")
      .eq("user_id", userId)
      .maybeSingle();
  
    if (error) {
      setSpinError("Could not check your previous spin.");
      return;
    }
  
    if (data) {
      setPrize(data.prize);
    } else {
      setPrize("");
    }
  }

  useEffect(() => {
    async function restoreSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      if (session?.user) {
        setUserFromSession(session.user);
        await loadExistingSpinResult(session.user.id);
        setScreen("game");
      } else {
        setScreen("login");
      }
  
      setAuthChecking(false);
    }
  
    restoreSession();
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserFromSession(session.user);
        await loadExistingSpinResult(session.user.id);
        setScreen("game");
      } else {
        setCurrentUser(null);
        setScreen("login");
      }
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();

    setLoginError("");
    setAuthMessage("");

    if (!loginData.email || !loginData.password) {
      setLoginError("Please enter your email and password.");
      return;
    }

    setAuthLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    setAuthLoading(false);

    if (error) {
      setLoginError(error.message);
      return;
    }
    
    const user = data.user;
    
    setUserFromSession(user);
    await loadExistingSpinResult(user.id);
    
    setLoginData(initialLoginData);
    setShowLoginPassword(false);
    setScreen("game");
  }

  async function handleRegister(e) {
    e.preventDefault();

    setRegisterError("");

    const hasMissingRequiredFields =
      !registerData.firstName.trim() ||
      !registerData.lastName.trim() ||
      !registerData.email.trim() ||
      !registerData.phone.trim() ||
      !registerData.password;

    const hasInvalidInput =
      !validateEmail(registerData.email) ||
      !validatePHPhoneNumber(registerData.phone) ||
      registerData.password.length < 8;

    if (
      hasMissingRequiredFields ||
      hasInvalidInput ||
      !registerData.termsAccepted
    ) {
      setRegisterError("Please fill in all required fields correctly.");
      return;
    }

    const cleanedPhone = registerData.phone.replace(/\D/g, "");
    const fullPhoneNumber = `${registerData.countryCode}${cleanedPhone}`;

    setAuthLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          phone: fullPhoneNumber,
          termsAccepted: registerData.termsAccepted,
          marketingOptIn: registerData.marketingOptIn,
        },
      },
    });

    setAuthLoading(false);

    if (error) {
      setRegisterError(error.message);
      return;
    }

    if (!data.session) {
      goToLogin(
        "Account created. Please check your email to confirm your account, then log in."
      );
      return;
    }

    setCurrentUser({
      fullName: `${registerData.firstName} ${registerData.lastName}`,
      email: registerData.email,
      phone: fullPhoneNumber,
      marketingOptIn: registerData.marketingOptIn,
    });
    
    setRegisterData(initialRegisterData);
    setShowRegisterPassword(false);
    setPrize("");
    setSpinError("");
    setScreen("game");
  }

  async function handleSpin() {
    if (spinning || prize) return;
  
    setSpinError("");
  
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
  
    if (userError || !user) {
      setSpinError("Please log in first.");
      return;
    }
  
    const { data: existingSpin, error: existingSpinError } = await supabase
      .from("spin_results")
      .select("prize")
      .eq("user_id", user.id)
      .maybeSingle();
  
    if (existingSpinError) {
      setSpinError("Could not check your previous spin.");
      return;
    }
  
    if (existingSpin) {
      setPrize(existingSpin.prize);
      return;
    }
  
    const winningIndex = Math.floor(Math.random() * prizes.length);
    const winningPrize = prizes[winningIndex].result;
  
    setSpinning(true);
  
    const targetAngle = 360 - (winningIndex * segmentAngle + segmentAngle / 2);
  
    setWheelRotation((currentRotation) => {
      return currentRotation + 360 * 5 + targetAngle;
    });
  
    const { error } = await supabase.from("spin_results").insert({
      user_id: user.id,
      prize: winningPrize,
    });
  
    setTimeout(() => {
      if (error) {
        setSpinError("You have already spun the wheel.");
        setSpinning(false);
        return;
      }
  
      setPrize(winningPrize);
      setSpinning(false);
    }, 3000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setCurrentUser(null);
    setLoginData(initialLoginData);
    setRegisterData(initialRegisterData);
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setAuthMessage("");
    setLoginError("");
    setRegisterError("");
    setPrize("");
    setSpinError("");
    setSpinning(false);
    setScreen("login");
    setWheelRotation(0);
  }

  const passwordStrength = getPasswordStrength(registerData.password);

  if (authChecking) {
    return (
      <main className="flex items-center justify-center min-h-screen w-full font-lato bg-gradient-to-r from-[#f0e5ff] to-[#e0c8ff]">
        <div className="flex flex-col items-center justify-center min-w-md p-6 bg-white rounded-lg shadow-md">
          <p className="text-[#a262f0] font-bold">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen w-full font-lato bg-gradient-to-r from-[#f0e5ff] to-[#e0c8ff]">
      <div className="flex flex-col items-center justify-center min-w-md p-6 bg-white rounded-lg shadow-md">
        {screen === "login" && (
          <section className="flex flex-col items-center">
            <div className="flex flex-row items-center justify-center gap-2 my-2">
              <img
                src={logo}
                alt="Giftaway Logo"
                className="flex items-start w-45 mb-4"
              />
              <label className="text-3xl font-extrabold mb-4 text-[#a262f0]">
                Login
              </label>
            </div>

            <form
              onSubmit={handleLogin}
              className="flex flex-col items-center w-xs mb-4"
            >
              {authMessage && (
                <p className="w-full mb-3 rounded-md bg-green-100 px-3 py-2 text-sm font-semibold text-green-700">
                  {authMessage}
                </p>
              )}

              {loginError && (
                <p className="w-full mb-3 rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-600">
                  {loginError}
                </p>
              )}

              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md overflow-hidden">
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
                <div className="flex items-center justify-center w-11.5 h-10 bg-[#a262f0]">
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
                disabled={authLoading}
                className="bg-[#a262f0] text-white font-bold w-full p-2 rounded-md cursor-pointer hover:bg-[#8a4bd0] transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {authLoading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <p>
              No account yet?{" "}
              <button
                type="button"
                className="text-[#a262f0] font-bold cursor-pointer hover:text-[#8a4bd0] transition duration-300"
                onClick={goToRegister}
              >
                Register
              </button>
            </p>
          </section>
        )}

        {screen === "register" && (
          <section className="flex flex-col items-center w-md">
            <div className="flex flex-row items-center justify-center gap-2 my-2">
              <img
                src={logo}
                alt="Giftaway Logo"
                className="flex items-start w-45 mb-4"
              />
              <label className="text-3xl font-extrabold mb-4 text-[#a262f0]">
                Register
              </label>
            </div>

            <form
              onSubmit={handleRegister}
              className="flex flex-col items-center w-sm mb-2"
            >
              {registerError && (
                <p className="w-full mb-3 rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-600">
                  {registerError}
                </p>
              )}

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

              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md overflow-hidden">
                <div className="flex items-center justify-center w-16 h-10 bg-[#a262f0]">
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

              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md overflow-hidden">
                <div className="flex items-center justify-center h-10 w-16 bg-[#f6efff] border-r-2 border-[#a262f0] text-[#a262f0] font-bold">
                  +63
                </div>

                <input
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  maxLength={10}
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  className="w-full h-10 py-1 px-2 outline-none focus:outline-none focus:ring-0"
                  placeholder="9XXXXXXXXX"
                />
              </div>

              <div className="flex flex-row items-start mb-4 w-full border-[#a262f0] border-2 rounded-md overflow-hidden">
                <div className="flex items-center justify-center w-17.75 h-10 bg-[#a262f0]">
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
                  onClick={() =>
                    setShowRegisterPassword(!showRegisterPassword)
                  }
                  className="flex items-center justify-center w-10 h-10 text-[#a262f0] cursor-pointer"
                >
                  {showRegisterPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              <div className="w-full mb-4">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.width} ${passwordStrength.color} transition-all duration-300`}
                  />
                </div>

                {registerData.password && (
                  <p
                    className={`mt-1 text-sm font-semibold ${passwordStrength.textColor}`}
                  >
                    Password strength: {passwordStrength.label}
                  </p>
                )}
              </div>

              <label className="flex items-start gap-2 w-full mb-4 text-sm">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={registerData.termsAccepted}
                  onChange={handleRegisterChange}
                  className="mt-1 h-4 w-4 accent-[#a262f0] cursor-pointer"
                />
                <span>
                  I agree to the Terms and Conditions and Privacy Policy
                  <span className="text-[#a262f0] font-bold"> *</span>
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
                disabled={authLoading}
                className="bg-[#a262f0] text-white font-bold w-full p-2 rounded-md cursor-pointer hover:bg-[#8a4bd0] transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {authLoading ? "Creating account..." : "Register"}
              </button>
            </form>

            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="text-[#a262f0] font-bold cursor-pointer hover:text-[#8a4bd0] transition duration-300"
                onClick={() => goToLogin()}
              >
                Log In
              </button>
            </p>
          </section>
        )}

        {screen === "game" && (
          <section className="flex flex-col items-center w-sm">
            <header className="w-full flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-[#a262f0]">
                  Spin the Wheel
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {currentUser?.fullName}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="text-[#a262f0] font-bold cursor-pointer hover:text-[#8a4bd0] transition duration-300"
              >
                Logout
              </button>
            </header>

            {spinError && (
              <p className="w-full mb-3 rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-600">
                {spinError}
              </p>
            )}

            <div className="relative mb-6 h-64 w-64">
              <div className="absolute left-1/2 top-[-12px] z-20 -translate-x-1/2">
                <div
                  className="h-7 w-7 bg-[#a262f0]"
                  style={{
                    clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                  }}
                />
              </div>

              <div
                className="absolute inset-0 rounded-full border-8 border-[#a262f0] shadow-lg overflow-hidden"
                style={{
                  background: wheelBackground,
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: "transform 3s cubic-bezier(0.12, 0.7, 0.1, 1)",
                }}
              >
                {prizes.map((prizeItem, index) => {
                  const angle = index * segmentAngle + segmentAngle / 2;

                  return (
                    <div
                      key={prizeItem.result}
                      className="absolute left-1/2 top-1/2 flex h-10 w-20 items-center justify-center text-center text-sm font-extrabold text-white drop-shadow-md"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-82px) rotate(90deg)`,
                      }}
                    >
                      {prizeItem.icon === "coffee" && <Coffee size={24} />}
                      {prizeItem.icon === "gift" && <Gift size={24} />}
                      {prizeItem.icon === "frown" && <Frown size={24} />}
                      {!prizeItem.icon && <span>{prizeItem.label}</span>}
                    </div>
                  );
                })}
              </div>

              <div className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-center text-sm font-extrabold text-[#a262f0] shadow-md">
                {spinning ? "..." : "SPIN"}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning || Boolean(prize)}
              className="bg-[#a262f0] text-white font-bold w-full p-2 rounded-md cursor-pointer hover:bg-[#8a4bd0] transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {spinning ? "Spinning..." : prize ? "Already Spun" : "Spin"}
            </button>

            {prize && (
              <p className="mt-5 text-lg">
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