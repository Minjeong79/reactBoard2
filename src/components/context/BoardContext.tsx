import { createContext } from "react";
import { CollectionReference, DocumentData } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { firestore } from "../../firebase-config";

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

interface BoardHeaderContextProps {
  handleLogin: (user: unknown) => void;
  handleLogout: () => void;
  userCollection: CollectionReference<DocumentData, DocumentData>;
  userLogin: User;
}

//맞는 초기 값 필수
// 초기값 설정 (임시로 빈 객체를 사용)
const initialBoardHeaderContextValue: BoardHeaderContextProps = {
  handleLogin: () => {},
  handleLogout: () => {},
  userCollection: collection(firestore, "users"),
  userLogin: {
    apiKey: "",
    appName: "",
    createdAt: "",
    displayName: "",
    email: "",
    emailVerified: false,
    isAnonymous: false,
    lastLoginAt: "",
    providerData: [],
    stsTokenManager: {
      refreshToken: "",
      accessToken: "",
      expirationTime: 0,
    },
    uid: "",
  },
};

export const BoardHeadercontext = createContext<BoardHeaderContextProps>(
  initialBoardHeaderContextValue
);

interface FormType {
  uid: string;
  displayName: string;
  timeData: string;
  content: string;
  isModify: boolean;
  index: string;
}

export const Boardcontext = createContext<FormType[]>([]);
