import { UserDto } from '../Dtos/User.dto';
import axios from 'axios';
import { safeData, WithError } from '../Core/Utils/Axios/safeData';
import { AppAuthConfig } from '../Core/Auth/AppAuthConfig';
import { AuthResponse } from 'msal';

class UsersServiceClass {
  public async getCurrentUserDetails(assignmentId: string): Promise<WithError<UserDto>> {
    const response = await axios.get<UserDto>(
      `${process.env.REACT_APP_EDNA_USERS_SERVICE_URL}/assignments/${assignmentId}/me`
    );

    return safeData(response);
  }
  public async getAllParticipantsDetails(assignmentId: string): Promise<WithError<UserDto[]>> {
    const response = await axios.get<UserDto[]>(
      `${process.env.REACT_APP_EDNA_USERS_SERVICE_URL}/assignments/${assignmentId}/users`
    );

    return safeData(response);
  }

  public async getCurrentUserImageBlob(): Promise<Blob> {
    const authResponse: AuthResponse = await AppAuthConfig.acquireTokenSilent({ scopes: ['user.read'] });
    const response = await axios.get('https://graph.microsoft.com/beta/me/photos/96x96/$value', {
      headers: {
        common: {
          Authorization: `bearer ${authResponse.accessToken}`
        }
      },
      responseType: 'blob'
    });

    return response.data;
  }
}

export const UsersService = new UsersServiceClass();
