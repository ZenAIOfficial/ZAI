/* tslint:disable */
/* eslint-disable */
export * from './runtime';
export * from './apis/index';
export * from './models/index';

import { DefaultApi } from "../generated/apis/DefaultApi";
import { ConfigurationParameters, Configuration } from "../generated/runtime";

export const createJupiterApiClient = (config?: ConfigurationParameters) => {
  return new DefaultApi(new Configuration(config));
};
