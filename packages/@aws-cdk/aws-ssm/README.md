## AWS Systems Manager Construct Library
This module is part of the [AWS Cloud Development Kit](https://github.com/awslabs/aws-cdk) project.

### Installation
Install the module:

```console
$ npm i @aws-cdk/aws-ssm
```

Import it into your code:

```ts
import ssm = require('@aws-cdk/aws-ssm');
```

### Using existing SSM Parameters in your CDK app

You can reference existing SSM Parameter Store values that you want to use in
your CDK app by using `ssm.ParameterStoreString`:

[using SSM parameter](test/integ.parameter-store-string.lit.ts)

### Creating new SSM Parameters in your CDK app

You can create either `ssm.StringParameter` or `ssm.StringListParameter`s in
a CDK app. These are public (not secret) values. Parameters of type
*SecretString* cannot be created directly from a CDK application; if you want
to provision secrets automatically, use Secrets Manager Secrets (see the
`@aws-cdk/aws-secretsmanager` package).

[creating SSM parameters](test/integ.parameter.lit.ts)

When specifying an `allowedPattern`, the values provided as string literals
are validated against the pattern and an exception is raised if a value
provided does not comply.
