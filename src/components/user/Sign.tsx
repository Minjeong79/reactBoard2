import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { appAuth } from "../../firebase-config";
const Sign = () => {
  const [nickNameValue, setNickNameValue] = useState("");
  const [emailValue, setEamilValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const auth = appAuth;
  const nav = useNavigate();

  const hadleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
      if (auth.currentUser) {
        updateProfile(auth.currentUser, {
          displayName: nickNameValue,
        });
      } else {
        console.log("사용자 정보가 없습니다");
      }
      setEamilValue("");
      setPasswordValue("");
      setNickNameValue("");
      nav("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="md:max-w-screen-sm  mx-auto mt-20">
      <h3 className="text-indigo-700 text-2xl font-bold">회원가입</h3>
      <div className="mt-4">
        <form onSubmit={hadleSubmit}>
          <div className="mt-4">
            <input
              className="border rounded-md p-2 focus:outline-none w-full"
              type="text"
              placeholder="닉네임"
              value={nickNameValue}
              onChange={(e) => setNickNameValue(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <input
              className="border rounded-md p-2 focus:outline-none w-full"
              type="text"
              placeholder="이메일"
              value={emailValue}
              onChange={(e) => setEamilValue(e.target.value)}
            />
          </div>
          <div className="mt-2">
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
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sign;
