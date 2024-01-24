import logo from "../../../public/logo.png";
import { Link } from "react-router-dom";
import "../../style/index.css";
import { useContext } from "react";
import { BoardHeadercontext } from "../context/BoardContext";

const Header = () => {
  const { handleLogout, userLogin } = useContext(BoardHeadercontext);
  const userLoginUid = userLogin.uid;
  const userLogindisplayName = userLogin.displayName;
  const handleLogoutClick = () => {
    handleLogout();
  };

  return (
    <header className="container border-b border-gray-200 p-2">
      <ul className="flex justify-between mt-8">
        <li className="">
          <Link to={"/"}>
            <img src={logo} alt="로고 이미지" />
          </Link>
        </li>
        {userLoginUid ? (
          <></>
        ) : (
          <li className=" ml-auto text-center text-sm cursor-pointer">
            <Link to={"/sign"}>회원가입</Link>
          </li>
        )}
        {userLoginUid ? (
          <></>
        ) : (
          <li className=" ml-2 text-center text-sm cursor-pointer">
            {/* <Login /> */}
            <Link to={"/login"}>로그인</Link>
          </li>
        )}

        {userLoginUid ? (
          <li className=" ml-7 text-center text-sm cursor-pointer">
            <span>{userLogindisplayName} 님 </span>
            <button
              className="bg-indigo-600 w-16 h-5 p-1 text-xs text-white rounded-md"
              onClick={handleLogoutClick}
            >
              <span>로그아웃</span>
            </button>
          </li>
        ) : (
          <></>
        )}
      </ul>
    </header>
  );
};

export default Header;
