import { useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { customAlphabet } from "nanoid";
import { doc, collection, setDoc } from "firebase/firestore";
import { BoardHeadercontext } from "../context/BoardContext";

const ReplyComment = () => {
  const { userLogin, userCollection } = useContext(BoardHeadercontext);
  const location = useLocation();
  const stateId = location.state;

  const paramsId = useParams();
  const paramsId_id = paramsId.id;
  const nav = useNavigate();
  const userLoginUid = userLogin.uid;
  const userLogindisplayName = userLogin.displayName;
  const nanoid = customAlphabet("123456789", 6);
  const strIdReply = nanoid();

  const [commentValue, setCommentValueFormValu] = useState("");

  const userDocREf = doc(userCollection, stateId);
  const userCommentCollection = collection(userDocREf, "comment");
  const userCommentDoc = doc(userCommentCollection, paramsId_id);

  const date = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const parts = formattedDate.split("/");
  const result = `${parts[2]}.${parts[0]}.${parts[1]}`;

  const handleCommentReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCommentReplyCollection = collection(userCommentDoc, "reply");

      const commentInput = {
        uid: userLoginUid,
        displayName: userLogindisplayName,
        timeData: result,
        content: commentValue,
        isModify: false,
        index: strIdReply,
        commentIdx: paramsId_id,
      };

      await setDoc(doc(userCommentReplyCollection, strIdReply), commentInput);

      nav(`/page/${stateId}`, { state: strIdReply });
      setCommentValueFormValu("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommentCancle = () => {};
  return (
    <section className="mt-20">
      <h1>대댓글 등록</h1>
      <form onSubmit={handleCommentReply}>
        <div className="">
          <textarea
            className="border  p-1 rounded pt-1 h-20 resize-none mr-2 w-full"
            placeholder="내용을 입력 해주세요"
            value={commentValue}
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

export default ReplyComment;
