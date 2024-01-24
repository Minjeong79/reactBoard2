import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getDocs, doc, collection, setDoc } from "firebase/firestore";
import { BoardHeadercontext } from "../context/BoardContext";

interface FormType {
  uid: string;
  displayName: string;
  timeData: string;
  content: string;
  isModify: boolean;
  index: string;
}
const initialUserForm: FormType[] = [
  {
    uid: "",
    displayName: "",
    timeData: "",
    content: "",
    isModify: false,
    index: "",
  },
];
const CommentModify = () => {
  const { userCollection, userLogin } = useContext(BoardHeadercontext);
  const location = useLocation();
  const stateId = location.state;

  const paramsId = useParams();
  const nav = useNavigate();
  const userLoginUid = userLogin.uid;
  const userLogindisplayName = userLogin.displayName;

  const [userDataList, setUserDataList] = useState(initialUserForm);
  const [commentValue, setCommentValueFormValu] = useState("");

  const date = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const parts = formattedDate.split("/");
  const result = `${parts[2]}.${parts[0]}.${parts[1]}`;

  //전체 댓글 출력
  const userData = async () => {
    const userDocREf = doc(userCollection, stateId);
    const userCommentCollection = collection(userDocREf, "comment");
    const userCommentDoc = await getDocs(userCommentCollection);
    const newDataList = userCommentDoc.docs.map((i) => {
      const data = i.data() as FormType;
      if (paramsId.id === i.id) {
        return data;
      }
      return undefined;
    });

    //여기서 undefined가 포함 될 수 있다는 에러가 뜸
    const lastData = newDataList.filter(
      (item) => item !== undefined
    )! as FormType[];
    setUserDataList(lastData);
  };

  //댓글 수정
  const handleCommentModify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userDocREf = doc(userCollection, stateId);
    const userCommentCollection = collection(userDocREf, "comment");
    try {
      const commentInput = {
        uid: userLoginUid,
        displayName: userLogindisplayName,
        timeData: result,
        content: commentValue,
        isModify: true,
        index: paramsId.id,
      };

      await setDoc(doc(userCommentCollection, paramsId.id), commentInput);
      setCommentValueFormValu("");
      nav(`/page/${stateId}`, { state: { data: commentInput } });
      // window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommentCancle = () => {
    window.confirm("취소 하시 겠습니까?");
    nav(`/page/${stateId}`);
  };

  useEffect(() => {
    userData();
  }, []);

  return (
    <section className="mt-20">
      <form onSubmit={handleCommentModify}>
        <div className="">
          <textarea
            className="border  p-1 rounded pt-1 h-20 resize-none mr-2"
            placeholder="내용을 입력 해주세요"
            defaultValue={userDataList[0].content}
            onChange={(e) => setCommentValueFormValu(e.target.value)}
          />

          <div className="mt-8 text-center">
            <input type="submit" className="common_btn_up mr-1" value="등록" />
            <input
              type="button"
              className="common_btn_cancle"
              onClick={handleCommentCancle}
              value="취소"
            />
          </div>
        </div>
      </form>
    </section>
  );
};
export default CommentModify;
