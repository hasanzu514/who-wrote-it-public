const CURRENT_USER = "You";
const LINE_DATE_END = 22;
const LINE_TEXT_START = 23;

module.exports = function convertWhatsappToJSON(chatTextString) {
  const chatTextArr = chatTextString.split("\n");
  const jsonData = { replies: [], participants: [], numReplies: 0 };

  try {
    for (let i = 0, len = chatTextArr.length; i < len; i++) {
      const line = cleanLine(chatTextArr[i]);

      // skip line if empty, media omitted message + flag or e2e encryption message
      if (
        !line.length ||
        (i === 0 &&
          line.indexOf(
            "Messages to this group are now secured with end-to-end encryption."
          ) >= 0) ||
        line.includes("<Media omitted>") || line.includes("image omitted")
      ) {
        continue;
      }
      const date = getDate(line.slice(0, LINE_DATE_END));
      // console.log(line)

      // if no date, treat as additional line
      if (!date) {
        jsonData.replies[jsonData.replies.length - 1].message += `\n${line}`;
      } else {
        let { user, message } = getMessageDetails(line.slice(LINE_TEXT_START));
        if (user && user !== "" && message && message.split(" ").length > 5) {
          user = user.replace("-", "").trim();
          message = message.replace(": ", "").trim();

          jsonData.replies.push({
            name: user,
            message,
          });
        }
      }

    }
  } catch {
    const regExp = /\[([^)]+)\]/
    for (let i = 0, len = chatTextArr.length; i < len; i++) {
      const line = cleanLine(chatTextArr[i]);

      // skip line if empty, media omitted message + flag or e2e encryption message
      if (
        !line.length ||
        (i === 0 &&
          line.indexOf(
            "Messages to this group are now secured with end-to-end encryption."
          ) >= 0) ||
        line.includes("<Media omitted>") || line.includes("image omitted")
      ) {
        continue;
      }
      const findDate = regExp.exec(line)
      if (!findDate) {
        jsonData.replies[jsonData.replies.length - 1].message += `\n${line}`;
      } else {
        try {
          const resultSplit = line.split(regExp)
          const nameMessageSplit = resultSplit[2].split(/:(.+)/)
          let name = nameMessageSplit[0].trim()
          let message = nameMessageSplit[1].trim()
          name = name.replace("-", "").trim();
          message = message.replace(": ", "").trim();
          if (name && name !== "" && message && message.split(" ").length > 5) {
            jsonData.replies.push({
              name,
              message,
            });
          }
        }
        catch (err) {
          // console.log(err)
          // console.log(line)
        }
      }

    }
  }


  let participants = [...new Set(jsonData.replies.map((item) => item.name))];
  for (let participant of participants) {
    if (jsonData.replies.filter(reply => reply.name === participant).length < 5) {
      jsonData.replies = jsonData.replies.filter(reply => reply.name !== participant)
    }
  }
  participants = [...new Set(jsonData.replies.map((item) => item.name))];
  const participantsObject = participants.map((participant) => {
    return { name: participant };
  });

  jsonData.numReplies = jsonData.replies.length;
  jsonData.participants = participantsObject;
  return jsonData;
};

function cleanLine(line) {
  // strip chars: 8206 (ltr), 8236
  const stripChars = [8206, 8236].map((code) => String.fromCharCode(code));
  return line.replace(new RegExp(`(${stripChars.join("|")})`, "g"), "").trim();
}

function getDate(dateStr) {
  if (dateStr.slice(0, 3) !== "201" && dateStr.slice(0, 3) !== "202") {
    return null;
  }

  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(5, 7);
  const date = dateStr.slice(8, 10);

  return new Date(year, month, date).toISOString();
}

function getMessageDetails(messageStr) {
  // encryption message
  if (
    /Messages to this group are now secured with end-to-end encryption./.test(
      messageStr
    )
  ) {
    return {
      user: null,
      messageType: "system",
      message:
        "Messages to this group are now secured with end-to-end encryption.",
    };
  }

  // standard message
  let userEndIndex = messageStr.indexOf(":");
  let useStartIndex = messageStr.indexOf("-");

  if (userEndIndex >= 0) {
    const user = messageStr.slice(useStartIndex + 1, userEndIndex).trim();
    return {
      user,
      message: getUserMessage(messageStr, user),
      messageType: "message",
    };
  }

  // system message
  userEndIndex = messageStr.search(/\s(left)/);

  if (userEndIndex >= 0) {
    return {
      user: null,
      message: messageStr,
      messageType: "system",
    };
  }

  // action message
  userEndIndex = messageStr.search(/created|added|changed/);

  if (userEndIndex >= 0) {
    const userStr = messageStr.slice(0, userEndIndex);
    // TODO: current user to be configurable
    return {
      user: userStr === "You" ? CURRENT_USER : userStr,
      message: messageStr,
      messageType: "action",
    };
  }

  // unhandled message type
  return {
    user: null,
    message: messageStr,
    messageType: null,
  };
}

function getUserMessage(messageStr, user = "") {
  return messageStr.slice(user.length + 2);
}
