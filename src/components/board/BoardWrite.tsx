import { useState, useContext, useReducer, useEffect } from "react";
import { BoardHeadercontext } from "../context/BoardContext";
import { useNavigate, useParams } from "react-router-dom";
import { customAlphabet } from "nanoid";
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
  listAll,
} from "firebase/storage";
import { doc, setDoc, getDocs } from "firebase/firestore";
import { firebaseApp } from "../../firebase-config";

type Action = {
  type: string;
  payload: FormType;
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

const initialUserForm: FormType[] = [
  {
    uid: "",
    displayName: "",
    timeData: new Date(),
    title: "",
    content: "",
    isModify: false,
    index: "",
  },
];

function reducer(state: FormType[], action: Action) {
  switch (action.type) {
    case "CREATE": {
      return [...state, action.payload];
    }
    default:
      return state;
  }
}
const BoardWrite = () => {
  const { userLogin, userCollection } = useContext(BoardHeadercontext);

  const paramsId = useParams();
  const nav = useNavigate();

  const userLoginUid = userLogin.uid;
  const userLogindisplayName = userLogin.displayName;

  const [strId, setStrId] = useState("");
  console.log(strId);
  console.log(paramsId.id);
  //데이터 등록
  const [userFormVar, dispatch] = useReducer(reducer, initialUserForm);
  console.log(userFormVar);
  //전체데이터 출력
  const [userDataList, setUserDataList] = useState(initialUserForm);

  const [formValue, setFormValu] = useState({
    title: "",
    content: "",
  });
  const [formModifyValue, setFormModifyValu] = useState({
    title: "",
    content: "",
  });

  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [oldimageNameUrl, setOldImageNameUrl] = useState("");
  const storage = getStorage(firebaseApp);

  const date = new Date();
  // const formattedDate = new Intl.DateTimeFormat("en-US", {
  //   year: "numeric",
  //   month: "2-digit",
  //   day: "2-digit",
  // }).format(date);
  // const parts = formattedDate.split("/");
  // const result = `${parts[2]}.${parts[0]}.${parts[1]}`;
 
  const formContentValu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formValue) {
      window.confirm("제목과 내용을 입력 해주세요");
      return;
    }
    try {
      const inputDb = {
        uid: userLoginUid,
        displayName: userLogindisplayName,
        timeData: date,
        title: formValue.title,
        content: formValue.content,
        isModify: false,
        index: strId,
      };
      dispatch({
        type: "CREATE",
        payload: inputDb,
      });
      await setDoc(doc(userCollection, strId), inputDb);
      nav(`/page/${strId}`);
      setFormValu({ title: "", content: "" });
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(strId);
  //데이터 출력ddddd
  const userData = async () => {
    const userDocRef = await getDocs(userCollection);
    userDocRef.docs.map((i) => {
      const data = i.data() as FormType;
      if (paramsId.id === i.id) {
        setUserDataList([data]);
      }
    });
  };

  //수정
  const formMotifyClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const inputDb = {
        uid: userLoginUid,
        displayName: userLogindisplayName,
        timeData: date,
        title: formModifyValue.title,
        content: formModifyValue.content,
        isModify: true,
        index: paramsId.id as string,
      };
      dispatch({
        type: "CREATE",
        payload: inputDb,
      });
      await setDoc(doc(userCollection, paramsId.id), inputDb);
      nav(`/page/${paramsId.id}`, { state: { payload: inputDb } });

      setFormModifyValu({ title: "", content: "" });
    } catch (error) {
      console.log(error);
    }
  };

  //이미지 등록
  const handleImageUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (imageUpload === null) return;
    //경로
    const imageRef = ref(storage, `images/${strId}/${imageUpload.name}`);

    //업로드 하는 곳 경로,올라갈 파일
    await uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrl(url);
      });
    });
  };

  //업로드 할 이미지 삭제
  const handleImageDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const desertRef = ref(storage, imageUrl);
    deleteObject(desertRef)
      .then(() => {
        setImageUrl("");
        console.log("삭제 완료");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //수정 이미지 등록
  const handleOldImageUpload = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (imageUpload === null) return;
    //경로
    const imageRef = ref(storage, `images/${paramsId.id}/${imageUpload.name}`);

    //업로드 하는 곳 경로,올라갈 파일
    await uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrl(url);
      });
    });
  };
  //수정 업로드 할 이미지 삭제
  const handleOldImageDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const desertRef = ref(storage, imageUrl);
    deleteObject(desertRef)
      .then(() => {
        setImageUrl("");
        console.log("삭제 완료");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  console.log(paramsId.id);
  useEffect(() => {
    const storage = getStorage(firebaseApp);
    const imageRef = ref(storage, `images/${paramsId.id}/`);
    console.log(imageRef);
    listAll(imageRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setOldImageNameUrl(url);
        });
      });
    });
  }, []);
  useEffect(() => {
    userData();
  }, []);
  useEffect(() => {
    const nanoidValue = customAlphabet("123456789", 9);
    setStrId(nanoidValue());
  }, [customAlphabet]);
  return (
    <section>
      {paramsId.id ? (
        <form onSubmit={formMotifyClick}>
          {userDataList.map((item, index) => (
            <div key={index}>
              <p className="text-xs mt-8">제목</p>
              <input
                type="text"
                name="title"
                maxLength={40}
                defaultValue={item.title}
                className="border w-full p-1 rounded pt-"
                placeholder="제목을 입력 해주세요."
                onChange={(e) =>
                  setFormModifyValu({
                    ...formModifyValue,
                    title: e.target.value,
                  })
                }
              />
              <p className="text-xs mt-4">내용</p>
              <div className=" h-96 overflow-y-auto border w-full p-1 rounded pt-1">
                <textarea
                  name="title"
                  maxLength={500}
                  defaultValue={item.content}
                  className="  h-60 resize-none  w-full outline-none"
                  placeholder="내용을 입력 해주세요"
                  onChange={(e) =>
                    setFormModifyValu({
                      ...formModifyValue,
                      content: e.target.value,
                    })
                  }
                />
                <img src={oldimageNameUrl} />
                <img src={imageUrl} />
              </div>
              <div>
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setImageUpload(file);
                    }
                  }}
                />
                <button
                  className="bg-gray-500 p-1 rounded mr-1"
                  onClick={handleOldImageUpload}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                    />
                  </svg>
                </button>
                <button
                  className="bg-gray-500 p-1 rounded"
                  onClick={handleOldImageDelete}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-8 text-center">
                <input
                  type="submit"
                  className="common_btn_up mr-2"
                  value="등록"
                />
                <input
                  type="button"
                  className="common_btn_cancle"
                  value="취소"
                />
              </div>
            </div>
          ))}
        </form>
      ) : (
        <form onSubmit={formContentValu}>
          <p className="text-xs mt-8">제목</p>
          <input
            type="text"
            name="title"
            maxLength={40}
            value={formValue.title}
            className="border w-full p-1 rounded pt-"
            placeholder="제목을 입력 해주세요."
            onChange={(e) =>
              setFormValu({ ...formValue, title: e.target.value })
            }
          />
          <p className="text-xs mt-4">내용</p>
          <div className="h-96 overflow-y-auto border w-full p-1 rounded pt-1">
            <textarea
              name="title"
              maxLength={500}
              value={formValue.content}
              className="  h-60 resize-none  w-full outline-none"
              placeholder="내용을 입력 해주세요"
              onChange={(e) =>
                setFormValu({ ...formValue, content: e.target.value })
              }
            />
            <img src={imageUrl} />
          </div>
          <div className="mt-2">
            <input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setImageUpload(file);
                }
              }}
            />
            <button
              className="bg-gray-500 p-1 rounded mr-1"
              onClick={handleImageUpload}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
                />
              </svg>
            </button>
            <button
              className="bg-gray-500 p-1 rounded"
              onClick={handleImageDelete}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 stroke-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
          <div className="mt-8 text-center">
            <input type="submit" className="common_btn_up mr-2" value="등록" />
            <input type="button" className="common_btn_cancle" value="취소" />
          </div>
        </form>
      )}
    </section>
  );
};

export default BoardWrite;
