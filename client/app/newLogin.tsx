import { useState } from "react";
import { Button, View } from "react-native";

type ChildProps = {
  setJwtToken: (token: string) => void;
};

type DisplayProps = {
  jwtToken: string;
};

const LoginButton = ({ setJwtToken }: ChildProps) => {
  return <Button title="u r amazing" onPress={() => setJwtToken("gay")} />;
};

const DisplayJwtButton = ({ jwtToken }: DisplayProps) => {
  return (
    <Button title="u r amazing" onPress={() => console.log({ jwtToken })} />
  );
};

// 2. The Main Screen that React actually "Runs"
export default function NewLogin() {
  const [jwtToken, setJwtToken] = useState<string>("");
  return (
    <View>
      <LoginButton setJwtToken={setJwtToken} />
      <DisplayJwtButton jwtToken={jwtToken} />
    </View>
  );
}
