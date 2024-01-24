import { useReducer, useMemo, useCallback, useEffect, useState } from "react";
import Header from "./components/board/Header";
import Board from "./components/board/Board";
import BoardPage from "./components/board/BoardPage";
import BoardWrite from "./components/board/BoardWrite";
import Login from "./components/user/Login";
import Sign from "./components/user/Sign";
import { appAuth } from "./firebase-config";
import { signOut } from "firebase/auth";
import "./style/index.css";
import { Routes, Route } from "react-router-dom";
import { BoardHeadercontext } from "./components/context/BoardContext";
import { firestore } from "./firebase-config";
import { collection } from "firebase/firestore";
import CommentModify from "./components/comment/CommentModify";
import ReplyComment from "./components/comment/ReplyComment";

type User = {
  apiKey: string;
  appName: string;
  createdAt: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  lastLoginAt: string;
  providerData: string[];
  stsTokenManager: {
    refreshToken: string;
    accessToken: string;
    expirationTime: number;
  };
  uid: string;
};

const userinitalState = {
  apiKey: "",
  appName: "",
  createdAt: "",
  displayName: "",
  email: "",
  emailVerified: false,
  isAnonymous: false,
  lastLoginAt: "string",
  providerData: [], // providerData에 대한 실제 타입을 알면 더 정확하게 지정 가능
  stsTokenManager: {
    refreshToken: "",
    accessToken: "",
    expirationTime: 0,
  },
  uid: "",
};

type Action = {
  type: string;
  payload?: unknown;
};

const initialUserState = {
  user: null,
};

function reducer(state: unknown, action: Action) {
  switch (action.type) {
    case "LOGIN": {
      // console.log(state); //기존 상태 초기 값
      // console.log(action.payload); //추가 하는 값
      return { user: action.payload };
    }
    case "LOGOUT": {
      return { user: action.payload };
    }
    default:
      return state;
  }
}
const App = () => {
  const [userValue, dispatch] = useReducer(reducer, initialUserState);
  const [userLogin, setUserLogin] = useState<User>(userinitalState);
  console.log(userValue);

  const userCollection = collection(firestore, "users");
  const auth = appAuth;
  // console.log(auth.currentUser);

  const handleLogin = useCallback((user: unknown) => {
    const loginUser = user;
    dispatch({
      type: "LOGIN",
      payload: loginUser,
    });

    localStorage.setItem("user", JSON.stringify(loginUser));
  }, []);

  const handleLogout = () => {
    window.confirm("로그아웃 하시겠습니까?");
    signOut(auth)
      .then(() => {
        dispatch({
          type: "LOGOUT",
          payload: null,
        });
        localStorage.removeItem("user");
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
        console.log("로그아웃 실패");
      });
  };

  const memoziedDispatches = useMemo(() => {
    return {
      handleLogin,
      userLogin,
      handleLogout,
      userCollection,
    };
  }, [handleLogin, userLogin]);

  useEffect(() => {
    const userFromLocalStorage = localStorage.getItem("user");
    if (userFromLocalStorage) {
      const userlogin = JSON.parse(userFromLocalStorage);
      dispatch({
        type: "LOGIN",
        payload: userlogin,
      });

      setUserLogin(userlogin);
    }
  }, []);

  return (
    <BoardHeadercontext.Provider value={memoziedDispatches}>
      <div className="md:container mx-auto">
        <Header />

        <Routes>
          {/* <h1 className="text-xl text-center p-14">리액트 공지 게시판 입니다</h1> */}

          <Route path="/page/:id" element={<BoardPage />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Board />} />
          <Route path="/write" element={<BoardWrite />} />
          <Route path="/write/:id" element={<BoardWrite />} />
          <Route path="/commentModify/:id" element={<CommentModify />} />
          <Route path="/reply/:id" element={<ReplyComment />} />
        </Routes>
        <div></div>
      </div>
    </BoardHeadercontext.Provider>
  );
};
export default App;
