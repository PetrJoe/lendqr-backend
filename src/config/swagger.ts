import { OpenAPIV3 } from 'openapi-types';

const spec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Lendsqr Wallet Service',
    version: '1.0.0',
    description: 'MVP wallet service — fund, withdraw, transfer, karma blacklist enforcement.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          code: { type: 'string', example: 'INSUFFICIENT_FUNDS' },
          message: { type: 'string' },
          details: { type: 'object' },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string', nullable: true },
          wallet: {
            type: 'object',
            nullable: true,
            properties: {
              balance: { type: 'number', example: 1000.0 },
              currency: { type: 'string', example: 'NGN' },
            },
          },
        },
      },
      WalletResult: {
        type: 'object',
        properties: {
          reference: { type: 'string', example: 'FUND-1713180000000-AB12CD' },
          balance_before: { type: 'number', example: 500.0 },
          balance_after: { type: 'number', example: 1500.0 },
          currency: { type: 'string', example: 'NGN' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user and wallet',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['first_name', 'last_name', 'email', 'password'],
                properties: {
                  first_name: { type: 'string', example: 'Alice' },
                  last_name: { type: 'string', example: 'Test' },
                  email: { type: 'string', format: 'email', example: 'alice@test.com' },
                  phone: { type: 'string', example: '08012345678' },
                  password: { type: 'string', minLength: 8, example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserProfile' },
                        token: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '403': { description: 'User is blacklisted', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '409': { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '503': { description: 'Karma service unavailable', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a bearer token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alice@test.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserProfile' },
                        token: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset token',
        description: 'Always returns success to prevent user enumeration. In production the token would be emailed; for this MVP it is returned in the response.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'alice@test.com' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token issued (or silently ignored if email not found)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        message: { type: 'string' },
                        reset_token: { type: 'string', description: 'Present only when email matched a user. Use in /auth/reset-password.' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using a valid token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string', description: 'Token received from /auth/forgot-password' },
                  password: { type: 'string', minLength: 8, example: 'NewPassword123!' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'object', properties: { message: { type: 'string' } } },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid or expired token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get authenticated user profile and wallet snapshot',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/UserProfile' } } } } },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/wallet/balance': {
      get: {
        tags: ['Wallet'],
        summary: 'Get current wallet balance',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current balance',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { type: 'object', properties: { balance: { type: 'number' }, currency: { type: 'string' } } } } } } },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/wallet/fund': {
      post: {
        tags: ['Wallet'],
        summary: 'Add funds to wallet',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', minimum: 0.01, example: 1000 },
                  reference: { type: 'string', example: 'my-ref-001' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Wallet funded', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/WalletResult' } } } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/wallet/withdraw': {
      post: {
        tags: ['Wallet'],
        summary: 'Withdraw funds from wallet',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', minimum: 0.01, example: 500 },
                  reference: { type: 'string', example: 'my-ref-002' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Withdrawal successful', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/WalletResult' } } } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '422': { description: 'Insufficient funds', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/wallet/transfer': {
      post: {
        tags: ['Wallet'],
        summary: 'Transfer funds to another user',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'receiver_email'],
                properties: {
                  amount: { type: 'number', minimum: 0.01, example: 200 },
                  receiver_email: { type: 'string', format: 'email', example: 'bob@test.com' },
                  reference: { type: 'string', example: 'my-ref-003' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Transfer successful', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' }, data: { $ref: '#/components/schemas/WalletResult' } } } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Receiver not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '422': { description: 'Insufficient funds or self-transfer', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/wallet/transactions': {
      get: {
        tags: ['Wallet'],
        summary: 'List transaction history',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['FUND', 'WITHDRAW', 'TRANSFER_DEBIT', 'TRANSFER_CREDIT'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        ],
        responses: {
          '200': {
            description: 'Transaction list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          type: { type: 'string' },
                          amount_minor: { type: 'integer' },
                          balance_before_minor: { type: 'integer' },
                          balance_after_minor: { type: 'integer' },
                          reference: { type: 'string' },
                          related_reference: { type: 'string', nullable: true },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } } },
        },
      },
    },
  },
};

export default spec;
