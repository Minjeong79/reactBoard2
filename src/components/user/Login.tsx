import { useState, useContext } from "react";
import { appAuth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { BoardHeadercontext } from "../context/BoardContext";
import "../../style/index.css";

const Login = () => {
  const { handleLogin } = useContext(BoardHeadercontext);
  const [emailValue, setEamilValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const auth = appAuth;

  const nav = useNavigate();

  const handleLoginClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userData = await signInWithEmailAndPassword(
        auth,
        emailValue,
        passwordValue
      );
      const userDb = userData.user;
      console.log(userDb);
      handleLogin(userDb);

      if (userDb) {
        nav("/");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="md:container mx-auto mt-20">
      <h3 className="text-indigo-700 text-2xl font-bold">로그인</h3>
      <div className="mt-4">
        <form onSubmit={handleLoginClick}>
          <div>
            <input
              className="border rounded-md p-2 focus:outline-none w-full"
              type="text"
              placeholder="이메일"
              value={emailValue}
              onChange={(e) => setEamilValue(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <input
              className="border rounded-md p-2 focus:outline-none w-full"
              type="password"
              placeholder="비밀번호"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <button
              className="bg-indigo-700 rounded-md w-full h-9 text-white"
              type="submit"
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
