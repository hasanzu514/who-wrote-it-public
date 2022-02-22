const decode = (s) => {
  if (s) {
    let d = new TextDecoder();
    let a = s.split("").map((r) => r.charCodeAt());
    return d.decode(new Uint8Array(a));
  } else {
    return "";
  }
};

const convertFacebookToJSON = (allReplies) => {
  const data = JSON.parse(allReplies);
  const jsonData = {
    replies: data.messages.flatMap((messageObj) => {
      if (
        (messageObj.content?.split(" ").length > 5) &
        !messageObj.content?.includes("reacted")
      ) {
        return [
          {
            name: messageObj.sender_name,
            message: decode(messageObj.content),
          },
        ];
      } else {
        return [];
      }
    }),
    numReplies: 0,
    participants: [],
  };
  jsonData.numReplies = jsonData.replies.length;
  jsonData.participants = data.participants;
  return jsonData;
};
module.exports = convertFacebookToJSON;
