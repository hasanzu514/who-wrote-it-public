import ExampleStartButton from "./ExampleStartButton";
import Card from "../UI/Card";
import Reveal from "./Reveal";
import { useState } from "react";

const Examples = () => {
  const [enterExample, setEnterexample] = useState(false);
  const [social, setSocial] = useState(null);

  const exampleHandler = (socialMedia) => {
    setEnterexample(true);
    setSocial(socialMedia);
  };

  return (
    <Card>
      {!enterExample && (
        <>
          <p>Check out the example below from a FaceBook chat. In a real game, the time it takes you to answer a question affects the points you get!</p>
          <ExampleStartButton
            title="Facebook Example"
            social="Facebook"
            exampleHandler={exampleHandler}
          />
        </>
      )}
      {enterExample && <Reveal social={social} />}
    </Card>
  );
};

export default Examples;

