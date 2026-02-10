import { Pressable, Text, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import { useProfiles } from "../hooks/useProfile";
import { useAccessToken } from "../hooks/useAccessToken";

export default function LoginButton() {
  const { JwtToken, isLoading, error, request, promptAsync } = useAuth();
  const profileProps = useProfiles(JwtToken?.sessionToken || null);
  const accessTokenProps = useAccessToken(JwtToken?.sessionToken || null);

  // const allTokens = useMemo(() => {
  // }, [JwtToken]);

  return (
    <View>
      <Pressable onPress={() => promptAsync()} disabled={!request}>
        {isLoading ? (
          <Text> loading </Text>
        ) : JwtToken ? (
          <Text> logged in as f </Text>
        ) : (
          <Text> login pls. </Text>
        )}
      </Pressable>
      <Text>{JwtToken ? JwtToken.sessionToken : "asdf"}</Text>
    </View>
  );
}
