import { useState } from "react";
import { Button, View } from "react-native";
import { useAuth } from "../hooks/useAuth";


type ChildProps = {
  onLogin: () => void;
};

type DisplayProps = {
  jwtToken: string;
};

const LoginButton = ({onLogin} : ChildProps) => {
  return(
    <Button
    title = "u r amazing"
      onPress={() => onLogin()} 
    />
  )
}

const DisplayJwtButton = ({ jwtToken }: DisplayProps) => {
  return (
    <Button title="u r amazing" onPress={() => console.log({ jwtToken })} />
  );
};

// 2. The Main Screen that React actually "Runs"
export default function NewLogin() {
  const [jwtToken, setJwtToken] = useState<string>("");

  
const handleApiCall = async () => {
  const response = await useAuth("123");
  setJwtToken(JSON.stringify(response));
}

  return (
    <View>
      <LoginButton onLogin = {handleApiCall}/>
      <DisplayJwtButton jwtToken = {jwtToken}/>
    </View>
  );
}

