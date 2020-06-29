import { PlatformDto } from '../Dtos/Platform.dto';

export type Platform = Pick<PlatformDto, keyof PlatformDto> & { publicKey: string };
