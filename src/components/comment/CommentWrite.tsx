import { useEffect, useState, useContext, useReducer, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customAlphabet } from "nanoid";
import {
  getDocs,
  doc,
  collection,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { BoardHeadercontext } from "../context/BoardContext";

type Action =
  | { type: "CREATECOMMENT"; payload: FormType }
  | { type: "MODIFYCOMENT"; payload: FormType }
  | { type: "DELETECOMMENT" };

interface FormType {
  uid: string;
  displayName: string;
  timeData: Timestamp;
  content: string;
  isModify: boolean;
  index: string;
}
interface FormReplyType {
  uid: string;
  displayName: string;
  timeData: Timestamp;
  content: string;
  isModify: boolean;
  index: string;
  commentIdx: string;
}
interface PropsType {
  stateData: FormType;
  statestrIdReply: FormReplyType;
}
const initialUserForm: FormType[] = [
  {
    uid: "",
    displayName: "",
    timeData: Timestamp.now(),
    content: "",
    isModify: false,
    index: "",
  },
];
const initialUserReplyForm: FormReplyType[] = [
  {
    uid: "",
    displayName: "",
    timeData: Timestamp.now(),
    content: "",
    isModify: false,
    index: "",
    commentIdx: "",
  },
];

function reducer(state: FormType[], action: Action) {
  switch (action.type) {
    case "CREATECOMMENT": {
      return [...state, action.payload];
    }
    case "MODIFYCOMENT": {
      return [...state, action.payload];
    }
    case "DELETECOMMENT": {
      return [...state];
    }
    default:
      return state;
  }
}
const CommentWritet = (props: PropsType) => {
  const { userLogin, userCollection } = useContext(BoardHeadercontext);

  const paramsId = useParams();
  const paramsId_id = paramsId.id;
  const nav = useNavigate();
  const userLoginUid = userLogin.uid;
  const userLogindisplayName = userLogin.displayName;

  const nanoid = customAlphabet("123456789", 8);
  const strIdComment = nanoid();

  const [userComment, dispatch] = useReducer(reducer, initialUserForm);
  console.log(userComment);
  const [userDataList, setUserDataList] = useState(initialUserForm);
  const [commentValue, setCommentValueFormValu] = useState("");
  const [isDeleteClicked, setIsDeleteClicked] = useState(false);
  const [replyValue, setReplyValue] = useState(initialUserReplyForm);
  const userDocREf = doc(userCollection, paramsId.id);
  const userCommentCollection = collection(userDocREf, "comment");

  // const date = new Date();

  //댓글 추가
  const handleComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const commentInput = {
        uid: userLoginUid,
        displayName: userLogindisplayName,
        timeData: Timestamp.now(),
        content: commentValue,
        isModify: false,
        index: strIdComment,
      };
      dispatch({
        type: "CREATECOMMENT",
        payload: commentInput as FormType,
      });
      await setDoc(doc(userCommentCollection, strIdComment), commentInput);
      setCommentValueFormValu("");
      // window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  //전체 댓글 출력
  const userData = async () => {
    const userCommentDoc = await getDocs(userCommentCollection);
    const newDataList = userCommentDoc.docs.map((i) => {
      const data = i.data() as FormType;
      return data;
    });

    setUserDataList(newDataList);
  };

  //댓글 수정
  const handleCommentModify = (commentid: string) => {
    const commentInput = props.stateData;

    dispatch({
      type: "MODIFYCOMENT",
      payload: commentInput,
    });
    nav(`/commentModify/${commentid}`, { state: paramsId_id });
  };

  const handleCommentDelete = async (index: string) => {
    window.confirm("삭제 하시겠습니까?");
    setIsDeleteClicked(true);
    dispatch({
      type: "DELETECOMMENT",
    });
    userDataList.map((item) => {
      if (index === item.index) {
        deleteDoc(doc(userCommentCollection, index));
      }
    });
  };

  //대댓글로 이동
  const handleReply = (commentid: string) => {
    nav(`/reply/${commentid}`, { state: paramsId_id });
  };

  // 대댓글 유무
  const handleReplyexist = async () => {
    const getCommentList = await getDocs(userCommentCollection);
    const replyId: FormReplyType[] = [];
    getCommentList.docs.map(async (item) => {
      const data = item.data();
      const userCommentDoc = doc(userCommentCollection, data.index);
      const getReply = collection(userCommentDoc, "reply");
      const getReplyList = await getDocs(getReply);
      getReplyList.docs.map((t) => {
        const dataR = t.data() as FormReplyType;
        replyId.push(dataR);
        setReplyValue(replyId);
      });
    });
  };

  useEffect(() => {
    userData();
  }, [userCollection, paramsId.id, isDeleteClicked, commentValue]);

  // userDataList를 의존성 배열에서 제거
  useEffect(() => {
    userData();
    handleReplyexist();
  }, []);
  const timeFuc = (timestamp: Timestamp) => {
    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6;
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };
  const memoizedUserDataList = useMemo(() => userDataList, [userDataList]);

  return (
    <section className="mt-20">
      {userLoginUid ? (
        <form onSubmit={handleComment}>
          <div className="flex">
            <textarea
              className="border flex-1 p-1 rounded pt-1 h-20 resize-none mr-2"
              placeholder="내용을 입력 해주세요"
              value={commentValue}
              onChange={(e) => setCommentValueFormValu(e.target.value)}
            />

            <input type="submit" className="common_btn_up" value="등록" />
          </div>
        </form>
      ) : (
        <></>
      )}

      <div>
        <p className="mt-10">댓글 수 {memoizedUserDataList.length}</p>
        <div className="mt-4">
          <ul>
            {userDataList.map((item, indexI) => {
              const commentid = item.index;
              console.log(item.timeData);
              return (
                <li key={indexI} className=" border-b relative">
                  <p className="p-2">
                    {item.displayName}{" "}
                    <span className="text-xs ml-2">
                      {timeFuc(item.timeData)}
                    </span>
                  </p>
                  {userLoginUid === item.uid ? (
                    <div className="group absolute right-0 top-2 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 absolute right-0 top-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                        />
                      </svg>

                      <ul className="hidden bg-white mt-8 border w-16 text-sm p-4  group-hover:block ">
                        <li className="hover:text-indigo-700">
                          <button
                            onClick={() => handleCommentModify(commentid)}
                          >
                            수정
                          </button>
                        </li>
                        <li
                          className="hover:text-indigo-700"
                          onClick={() => handleCommentDelete(item.index)}
                        >
                          <button>삭제</button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div className="p-2 h-20 overflow-y-auto">{item.content}</div>

                  {replyValue.map((it, indexop) => {
                    return (
                      <div key={indexop}>
                        {item.index === it.commentIdx ? (
                          <div className="bg-slate-100 p-2">
                            <div className="text-right">
                              {it.displayName} {timeFuc(it.timeData)}
                            </div>
                            <div className="h-16 overflow-y-auto">
                              {it.content}
                            </div>
                            <p className="text-right p-1">
                              대댓글은 수정, 삭제 불가합니다
                            </p>
                          </div>
                        ) : (
                          <div className="mt-2 text-right mb-2">
                            <input
                              type="button"
                              className="common_btn_up"
                              value="등록"
                              onClick={() => handleReply(commentid)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div></div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CommentWritet;
