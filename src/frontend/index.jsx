import { invoke, view } from "@forge/bridge";
import ForgeReconciler, {
  Button,
  Form,
  FormFooter,
  FormSection,
  Label,
  RequiredAsterisk,
  Text,
  useForm,
  useProductContext,
  UserPicker
} from "@forge/react";
import React, { useEffect, useState } from "react";
const FIELD_NAME = "field-name";

export const Edit = () => {
  // const { handleSubmit, register, getFieldId } = useForm();
  const { handleSubmit, getFieldId } = useForm();
  const [selectedUser, setSelectedUser] = useState(null);

  // const configureGadget = (data) => {
  //   view.submit(data);
  // };
      const configureGadget = (formData = {}) => {
      console.log('=== CONFIGURE GADGET START ===');
      console.log('Form data received:', formData);
      console.log('Selected user state:', selectedUser);

      const dataToSubmit = {
        ...formData,
        [FIELD_NAME]: selectedUser ? {
          accountId: selectedUser.id || selectedUser.accountId, // Try 'id' first, then 'accountId'
          displayName: selectedUser.name || selectedUser.displayName, // Try 'name' first, then 'displayName'
          avatarUrl: selectedUser.avatarUrl
        } : null
      };
      console.log('Data to submit:', dataToSubmit);
      console.log('Calling view.submit...');
      try {
        view.submit(dataToSubmit);
        console.log('view.submit called successfully');
      } catch (error) {
        console.error('Error calling view.submit:', error);
      }
      
      console.log('=== CONFIGURE GADGET END ===');
    };
  const handleUserChange = (user) => {
    console.log('=== USER CHANGED ===');
    console.log('Selected user:', user);
    setSelectedUser(user);
  };

  return (
    <Form onSubmit={handleSubmit(configureGadget)}>
      <FormSection>
        <Label labelFor={getFieldId(FIELD_NAME)}>
        <RequiredAsterisk />
        </Label>
        <UserPicker
      label="Hahn Member"
      placeholder="Select a user"
      name={FIELD_NAME}
      onChange={handleUserChange}
      />
        {/* <Textfield {...register(FIELD_NAME, { required: true })} /> */}
      </FormSection>
      <FormFooter>
        <Button appearance="primary" type="submit">
          Submit
        </Button>
      </FormFooter>
    </Form>
  );
};

const View = () => {
  console.log('=== VIEW COMPONENT RENDER START ===');
  const [weekHours, setWeekHours] = useState(null);
  const [monthHours, setMonthHours] = useState(null);
  // const [data, setData] = useState(null);
  
  const context = useProductContext();
  console.log('View context:', context);
  // useEffect(() => {
  //   console.log('=== VIEW USEEFFECT RUNNING ===');
  //   // invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  //   invoke('getHoursOfWeek', { example: 'my-invoke-variable' }).then(setWeekHours).catch(error => console.error('Error getting week hours:', error));
  //   invoke('getHoursOfMonth', { example: 'my-invoke-variable' }).then(setMonthHours).catch(error => console.error('Error getting month hours:', error));
  // }, []);

  // if (!context) {
  //   console.log('View: No context, returning Loading...');
  //   return "Loading...";
  // }

    useEffect(() => {
    console.log('=== VIEW USEEFFECT RUNNING ===');
    
    if (!context) {
      console.log('No context yet');
      return;
    }
    
    const {
      extension: { gadgetConfiguration },
    } = context;

    const selectedUserConfig = gadgetConfiguration[FIELD_NAME];
    const accountId = selectedUserConfig?.accountId;
    
    console.log('Selected user config:', selectedUserConfig);
    console.log('Account ID:', accountId);
    
    if (accountId) {
      console.log('Calling getHoursOfWeek with accountId:', accountId);
      
      invoke('getHoursOfWeek', { accountId })  // Pass accountId here!
        .then(result => {
          console.log('Week hours result:', result);
          setWeekHours(result);
        })
        .catch(error => console.error('Error getting week hours:', error));
      
      invoke('getHoursOfMonth', { accountId })  // Pass accountId here too!
        .then(result => {
          console.log('Month hours result:', result);
          setMonthHours(result);
        })
        .catch(error => console.error('Error getting month hours:', error));
    } else {
      console.log('No accountId available');
    }
  }, [context]);

  if (!context) {
    return "Loading...";
  }
  
  const {
    extension: { gadgetConfiguration },
  } = context;
  console.log('Gadget configuration:', gadgetConfiguration);
  console.log('Field value:', gadgetConfiguration[FIELD_NAME]);

  const selectedUserConfig = gadgetConfiguration[FIELD_NAME];
  console.log('Selected user from config:', selectedUserConfig);
  
  const userName = selectedUserConfig?.displayName || selectedUserConfig?.accountId || 'No user selected';
  console.log('Display name:', userName);

  console.log('=== VIEW COMPONENT RENDER END ===');

  return (
    <>
      <Text>User: {userName}</Text>
      <Text>User's remaining assigned hours this week: {weekHours !== null ? weekHours : 'Loading...'}</Text>
      <Text>User's remaining assigned hours this month: {monthHours !== null ? monthHours : 'Loading...'}</Text>
    </>
  );
};

const App = () => {
  console.log('=== APP COMPONENT RENDER ===');
  const context = useProductContext();
  console.log('App context:', context);

  if (!context) {
    console.log('App: No context, returning Loading...');

    return "Loading...";
  }

  console.log('Entry point:', context.extension.entryPoint);
  const isEdit = context.extension.entryPoint === "edit";
  console.log('Is edit mode:', isEdit);

  return context.extension.entryPoint === "edit" ? <Edit /> : <View />;
};
console.log('=== STARTING FORGE RECONCILER ===');
ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
