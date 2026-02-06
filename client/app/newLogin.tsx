import { useState } from "react";
import { Button, View } from "react-native";


type ChildProps = {
  setJwtToken: (token: string) => void;
};

const LoginButton = ({setJwtToken} : ChildProps) => {
  return(
    <Button
    title = "u r amazing"
      onPress={() => setJwtToken("gay")} 
    />
  )
}

// 2. The Main Screen that React actually "Runs"
export default function NewLogin() {
  const [jwtToken, setJwtToken] = useState<string>("");
  return (
    <View>
      <LoginButton setCount = {setCount}/>
    </View>
  );
}