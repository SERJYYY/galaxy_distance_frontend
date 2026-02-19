/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Galaxy {
  /** ID */
  id?: number;
  /**
   * Название
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /**
   * Описание
   * @minLength 1
   */
  description: string;
  /**
   * Имя файла в MinIO
   * @maxLength 255
   */
  image_name?: string | null;
  /** Активна ли услуга */
  is_active?: boolean;
  /** Image url */
  image_url?: string;
}

export interface GalaxyCreate {
  /**
   * Название
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /**
   * Описание
   * @minLength 1
   */
  description: string;
  /**
   * Имя файла в MinIO
   * @maxLength 255
   */
  image_name?: string | null;
}

export interface GalaxyRequestList {
  /** ID */
  id?: number;
  /** Статус */
  status?: "draft" | "deleted" | "submitted" | "completed" | "rejected";
  /** Creator */
  creator?: string;
  /** Moderator */
  moderator?: string;
  /**
   * Телескоп
   * @maxLength 255
   */
  telescope?: string | null;
  /**
   * Created at
   * @format date-time
   */
  created_at?: string;
  /**
   * Submitted at
   * @format date-time
   */
  submitted_at?: string;
  /**
   * Completed at
   * @format date-time
   */
  completed_at?: string;
  /** Calculated galaxy count */
  calculated_galaxy_count?: string;
}

export interface UserProfile {
  /** ID */
  id?: number;
  /**
   * Имя пользователя
   * @minLength 1
   */
  username?: string;
  /**
   * Email
   * @format email
   * @minLength 1
   */
  email?: string | null;
  /**
   * Имя
   * @maxLength 30
   */
  first_name?: string;
  /**
   * Фамилия
   * @maxLength 30
   */
  last_name?: string;
  /** Is moderator */
  is_moderator?: string;
  /**
   * Old password
   * @minLength 1
   */
  old_password?: string;
  /**
   * New password
   * @minLength 1
   */
  new_password?: string;
}

export interface UserRegister {
  /** ID */
  id?: number;
  /**
   * Имя пользователя
   * @minLength 1
   * @maxLength 150
   */
  username: string;
  /**
   * Email
   * @format email
   * @maxLength 254
   */
  email?: string | null;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8000/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Snippets API
 * @version v1
 * @license BSD License
 * @termsOfService https://www.google.com/policies/terms/
 * @baseUrl http://localhost:8000/api
 * @contact <contact@snippets.local>
 *
 * Test description
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  galaxies = {
    /**
     * @description Получение списка галактик. Можно фильтровать по названию через параметр search.
     *
     * @tags galaxies
     * @name GalaxiesList
     * @request GET:/galaxies/
     * @secure
     */
    galaxiesList: (
      query?: {
        /** Фильтр по названию галактики (необязательный) */
        search?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Galaxy[], any>({
        path: `/galaxies/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Создание новой галактики (услуги). Доступно только модераторам.
     *
     * @tags Galaxies
     * @name CreateGalaxy
     * @request POST:/galaxies/create/
     * @secure
     */
    createGalaxy: (data: GalaxyCreate, params: RequestParams = {}) =>
      this.request<Galaxy, any>({
        path: `/galaxies/create/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить детальную информацию по одной галактике по ID
     *
     * @tags Galaxies
     * @name GetGalaxyDetail
     * @request GET:/galaxies/{id}/
     * @secure
     */
    getGalaxyDetail: (id: number, params: RequestParams = {}) =>
      this.request<Galaxy, void>({
        path: `/galaxies/${id}/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавить услугу (галактику) в черновую заявку текущего пользователя по ID из URL.
     *
     * @tags Galaxies
     * @name AddGalaxyToRequest
     * @request POST:/galaxies/{id}/add-to-request/
     * @secure
     */
    addGalaxyToRequest: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/galaxies/${id}/add-to-request/`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Мягкое удаление галактики по ID (деактивация)
     *
     * @tags Galaxies
     * @name DeleteGalaxy
     * @request DELETE:/galaxies/{id}/delete/
     * @secure
     */
    deleteGalaxy: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/galaxies/${id}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Обновление информации о галактике по ID
     *
     * @tags Galaxies
     * @name UpdateGalaxy
     * @request PUT:/galaxies/{id}/update/
     * @secure
     */
    updateGalaxy: (
      id: string,
      data: GalaxyCreate,
      params: RequestParams = {},
    ) =>
      this.request<Galaxy, any>({
        path: `/galaxies/${id}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Загрузка изображения для галактики по ID
     *
     * @tags Galaxies
     * @name UploadGalaxyImage
     * @request POST:/galaxies/{id}/upload-image/
     * @secure
     */
    uploadGalaxyImage: (
      id: string,
      data: {
        /**
         * Файл изображения
         * @format binary
         */
        image: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/galaxies/${id}/upload-image/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        ...params,
      }),
  };
  galaxyRequests = {
    /**
     * @description Список заявок. Для модератора — все заявки с фильтрацией. С датами в российском формате.
     *
     * @tags GalaxyRequests
     * @name GalaxyRequestsList
     * @request GET:/galaxy_requests/
     * @secure
     */
    galaxyRequestsList: (
      query?: {
        /** Дата с (дд.мм.гггг) */
        date_from?: string;
        /** Дата по (дд.мм.гггг) */
        date_to?: string;
        /** Статус заявки */
        status?: "submitted" | "completed" | "rejected";
      },
      params: RequestParams = {},
    ) =>
      this.request<GalaxyRequestList[], any>({
        path: `/galaxy_requests/`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить информацию о текущей черновой заявке пользователя (для отображения значка корзины).
     *
     * @tags GalaxyRequests
     * @name GetCartIcon
     * @request GET:/galaxy_requests/cart-icon/
     * @secure
     */
    getCartIcon: (params: RequestParams = {}) =>
      this.request<
        {
          /** ID черновой заявки */
          draft_id?: number;
          /** Количество услуг в черновой заявке */
          count?: number;
        },
        any
      >({
        path: `/galaxy_requests/cart-icon/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Мягкое удаление черновой заявки текущего пользователя
     *
     * @tags GalaxyRequests
     * @name GalaxyRequestsDeleteDelete
     * @request DELETE:/galaxy_requests/delete/
     * @secure
     */
    galaxyRequestsDeleteDelete: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/galaxy_requests/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Сформировать черновую заявку текущего пользователя. Проверка обязательных полей: telescope и magnitude для всех услуг.
     *
     * @tags GalaxyRequests
     * @name GalaxyRequestsFormUpdate
     * @request PUT:/galaxy_requests/form/
     * @secure
     */
    galaxyRequestsFormUpdate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/galaxy_requests/form/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description Обновить видимую звездную величину (magnitude) для услуги в черновой заявке
     *
     * @tags GalaxyInRequest
     * @name UpdateMagnitude
     * @request PUT:/galaxy_requests/update-magnitude/
     * @secure
     */
    updateMagnitude: (
      data: {
        /** Видимая звездная величина */
        magnitude: number;
        /** ID услуги */
        galaxy_id: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/galaxy_requests/update-magnitude/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Обновить поле telescope в текущей черновой заявке пользователя
     *
     * @tags GalaxyRequests
     * @name GalaxyRequestsUpdateUpdate
     * @request PUT:/galaxy_requests/update/
     * @secure
     */
    galaxyRequestsUpdateUpdate: (
      data: {
        telescope: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          telescope: string;
        },
        any
      >({
        path: `/galaxy_requests/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Детали заявки. Даты в формате РФ. Пользователь видит только свои, модератор — все (кроме черновых и удалённых).
     *
     * @tags GalaxyRequests
     * @name GalaxyRequestsRead
     * @request GET:/galaxy_requests/{id}/
     * @secure
     */
    galaxyRequestsRead: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          id?: number;
          status?: "submitted" | "completed" | "rejected";
          creator?: string;
          moderator?: string;
          telescope?: string;
          created_at?: string;
          submitted_at?: string;
          completed_at?: string;
          galaxies?: {
            id?: number;
            name?: string;
            magnitude?: number;
            distance?: number;
          }[];
        },
        void
      >({
        path: `/galaxy_requests/${id}/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Завершить или отклонить заявку модератором. Доступно только для заявок со статусом 'submitted'.
     *
     * @tags GalaxyRequests
     * @name GalaxyRequestsCompleteUpdate
     * @request PUT:/galaxy_requests/{id}/complete/
     * @secure
     */
    galaxyRequestsCompleteUpdate: (
      id: string,
      data: {
        action: "complete" | "rejected";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          action: "complete" | "rejected";
        },
        any
      >({
        path: `/galaxy_requests/${id}/complete/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удалить услугу (галактику) по её ID из текущей черновой заявки пользователя.
     *
     * @tags GalaxyInRequest
     * @name RemoveGalaxyFromDraft
     * @request DELETE:/galaxy_requests/{id}/remove-from-request/
     * @secure
     */
    removeGalaxyFromDraft: (id: string, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/galaxy_requests/${id}/remove-from-request/`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Авторизация пользователя (по username и password). Возвращает Set-Cookie(session_id).
     *
     * @tags users
     * @name UsersLoginCreate
     * @request POST:/users/login/
     * @secure
     */
    usersLoginCreate: (
      data: {
        /** Имя пользователя */
        username: string;
        /** Пароль */
        password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/users/login/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Выход пользователя из системы (удаление Redis-сессии и куки)
     *
     * @tags users
     * @name UsersLogoutCreate
     * @request POST:/users/logout/
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/logout/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Получить профиль текущего пользователя
     *
     * @tags Users
     * @name UsersProfileList
     * @request GET:/users/profile/
     * @secure
     */
    usersProfileList: (params: RequestParams = {}) =>
      this.request<UserProfile, void>({
        path: `/users/profile/`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменить профиль текущего пользователя
     *
     * @tags Users
     * @name UsersProfileUpdate
     * @request PUT:/users/profile/
     * @secure
     */
    usersProfileUpdate: (data: UserProfile, params: RequestParams = {}) =>
      this.request<UserProfile, void>({
        path: `/users/profile/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Регистрация нового пользователя. Доступно только для гостей (неавторизованных).
     *
     * @tags Users
     * @name UserRegister
     * @request POST:/users/register/
     * @secure
     */
    userRegister: (data: UserRegister, params: RequestParams = {}) =>
      this.request<UserRegister, void>({
        path: `/users/register/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
