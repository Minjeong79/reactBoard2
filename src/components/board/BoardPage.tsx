import {
  useEffect,
  useState,
  useCallback,
  useContext,
  useReducer,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { customAlphabet } from "nanoid";
import {
  getDocs,
  doc,
  collection,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "../../firebase-config";
import CommentWritet from "../comment/CommentWrite";
import { BoardHeadercontext } from "../context/BoardContext";

type Action = {
  type: string;
  payload?: FormType;
};
interface FormType {
  uid: string;
  displayName: string;
  timeData: Date;
  title: string;
  content: string;
  isModify: boolean;
  index: string;
}

const initialUserForm: FormType = {
  uid: "",
  displayName: "",
  timeData: new Date(),
  title: "",
  content: "",
  isModify: false,
  index: "",
};

function reducer(state: FormType, action: Action) {
  switch (action.type) {
    case "MODIFY": {
      // action.payload에는 수정된 데이터가 포함되어 있을 것이라 가정합니다.
      return { ...state, ...action.payload };
    }
    case "DELETE": {
      return { ...state };
    }
    default:
      return state;
  }
}

const BoardPage = () => {
  const location = useLocation();
  const state = location.state?.payload;
  const stateData = location.state?.data;
  const statestrIdReply = location.state;

  const [modify, dispatch] = useReducer(reducer, state as FormType);

  const { userCollection, userLogin } = useContext(BoardHeadercontext);

  const paramsId = useParams();
  const pageId = paramsId.id as string;
  const nav = useNavigate();

  const [userDataList, setUserDataLsit] = useState(initialUserForm);

  const [likeSize, setLikeSize] = useState(0);
  // const [imageUrl, setImageUrl] = useState("");
  const [imgList, setImgList] = useState<string[]>([]);
  const nanoid = customAlphabet("123456789", 8);
  const strId = nanoid();

  //데이터 출력
  const userData = async () => {
    const userDocRef = await getDocs(userCollection);
    userDocRef.docs.map((i) => {
      const data = i.data() as FormType;
      if (pageId === i.id) {
        setUserDataLsit(data);
      }
    });
  };

  //좋아요
  const handleLike = async () => {
    const userDocRef = await getDocs(userCollection);
    userDocRef.docs.map(async (i) => {
      const data = i.data() as FormType;
      if (paramsId.id === data.index) {
        const userDocREf = doc(userCollection, data.index);
        const userLikeCollection = collection(userDocREf, "like");
        const like = {
          like: true,
          uid: userLogin.uid,
        };

        const userLikdeDocs = await getDocs(userLikeCollection);
        const userAlreadyLiked = userLikdeDocs.docs.find((it) => {
          const likeDatas = it.data();
          return userLogin.uid === likeDatas.uid;
        });

        if (!userAlreadyLiked) {
          await setDoc(doc(userLikeCollection, strId as string), like);
        } else {
          await deleteDoc(
            doc(userLikeCollection, userAlreadyLiked.id as string)
          );
        }

        const likeSizeDoc = await getDocs(userLikeCollection);
        const likeLength = likeSizeDoc.size;
        setLikeSize(likeLength);
      }
    });
  };

  useEffect(() => {
    userData();
  }, []);

  //목록
  const handleBoard = () => {
    nav(`/`);
  };

  //수정
  const handleModify = useCallback(() => {
    dispatch({
      type: "MODIFY",
      payload: modify,
    });
    //네비게이션을 통해 props전달
    // nav(`/write/${paramsId.id}`, { state: { payload: data } });
    nav(`/write/${pageId}`);
  }, [modify]);

  //삭제
  const handleDelte = async () => {
    window.confirm("삭제 하시겠습니까?");
    dispatch({
      type: "DELETE",
      payload: { ...userDataList },
    });
    const userDocRef = await getDocs(userCollection);

    userDocRef.docs.map((i) => {
      if (pageId === i.id) {
        deleteDoc(doc(userCollection, pageId));
      }
    });
    nav(`/`);
  };

  useEffect(() => {
    const storage = getStorage(firebaseApp);
    const imageRef = ref(storage, `images/${pageId}/`);

    listAll(imageRef)
      .then((response) => {
        const downloadURLPromises = response.items.map((item) =>
          getDownloadURL(item)
        );
        return Promise.all(downloadURLPromises);
      })
      .then((urls) => {
        setImgList(urls);
      })
      .catch((error) => {
        console.error("Error getting download URLs:", error);
      });
  }, []);
  const timeFuc = (timestamp: firestore.Timestamp) => {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };
  return (
    <section>
      <div className="mt-8">
        <p className="p-2 border-b"> {userDataList.title} </p>
        <p className="p-2 text-right">
          {userDataList.displayName}
          <span className="text-xs ml-2">{timeFuc(userDataList.timeData)}</span>
        </p>

        <div className="p-2 h-80 border-b overflow-y-auto">
          {userDataList.contentdd}
          {imgList.map((item, index) => (
            <div key={index}>
              <img src={item} alt={`Image ${index}`} />
            </div>
          ))}
          {/* {imgList ? <img src={imageUrl} /> : <></>} */}
        </div>
        <div className="flex mt-2 justify-between ">
          <div className="flex items-center">
            <button className="mr-2" onClick={handleLike}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 stroke-indigo-700 "
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                />
              </svg>
            </button>
            <span>{likeSize}</span>
          </div>

          <button className="border p-1 px-6" onClick={handleBoard}>
            목록
          </button>
        </div>
      </div>
      {userDataList.uid === userLogin.uid ? (
        <div className="mt-8 text-center">
          <button className="common_btn_up mr-2" onClick={handleModify}>
            수정
          </button>
          <button className="common_btn_cancle" onClick={handleDelte}>
            삭제
          </button>
        </div>
      ) : (
        <></>
      )}
      <CommentWritet stateData={stateData} statestrIdReply={statestrIdReply} />
    </section>
    //{" "}
  );
};

export default BoardPage;
