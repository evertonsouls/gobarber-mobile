import React, { useRef, useCallback } from 'react';
import { KeyboardAvoidingView, View, Platform, Image, ScrollView, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile'
import * as Yup from 'yup';

import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

import {
  Container, Title, BackToSignInButton, BackToSignInButtonText
} from './styles'

const SignUp: React.FC = () => {
  const navigation = useNavigation();

  const formRef = useRef<FormHandles>(null);

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleSignUp = useCallback(async (data: SignUpFormData) => {
    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string().required('Nome obrigatório'),
        email: Yup.string()
          .required('Email obrigatório')
          .email('Digite um e-mail válido.'),
        password: Yup.string().required('Senha obrigatória'),
      });

      await schema.validate(data, { abortEarly: false });

      await api.post('/users', data)

      Alert.alert('Cadastro realizado con sucesso!', 'Você já pode faze logon na aplicação.')

      navigation.goBack();

    } catch (err) {
      console.log(err.response);
      if (err instanceof Yup.ValidationError) {
        const errors = getValidationErrors(err);

        formRef.current?.setErrors(errors);
      } else {
        Alert.alert(
          'Erro na cadastro',
          'Ocorreu un erro ao fazer cadastro, tente novamente.'
        )
      }
    }
  }, [navigation]);

  return <>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled
    >
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Container>
          <Image source={logoImg} />

          <View>
            <Title>Crie sua conta</Title>
          </View>

          <Form ref={formRef} onSubmit={handleSignUp} style={{ width: '100%' }}>

            <Input
              autoCapitalize="words"
              name="name"
              icon="user"
              placeholder="Nome"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
            />

            <Input
              ref={emailInputRef}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              name="email"
              icon="mail"
              placeholder="E-mail"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />

            <Input
              ref={passwordInputRef}
              secureTextEntry
              textContentType="newPassword"
              name="password"
              icon="lock"
              placeholder="Senha"
              returnKeyType="done"
              onSubmitEditing={() => formRef.current?.submitForm()}
            />

            <Button
              onPress={() => formRef.current?.submitForm()}
            >
              Entrar
            </Button>

          </Form>

        </Container>
      </ScrollView>
    </KeyboardAvoidingView>

    <BackToSignInButton onPress={() => { navigation.goBack(); }}>
      <Icon name="arrow-left" size={20} color="#fff" />
      <BackToSignInButtonText>
        Voltar para logon
      </BackToSignInButtonText>
    </BackToSignInButton>
  </>
}

export default SignUp;
