import cxapi = require('@aws-cdk/cx-api');
import { Test } from 'nodeunit';
import { SDK } from '../../lib';
import { AppStacks, ExtendedStackSelection } from '../../lib/api/cxapp/stacks';
import { Renames } from '../../lib/renames';
import { Configuration } from '../../lib/settings';
import { testAssembly, TestStackArtifact } from '../util';

const FIXED_RESULT = testAssembly({
  stackName: 'withouterrors',
  template: { resource: 'noerrorresource' },
},
{
  stackName: 'witherrors',
  autoDeploy: true,
  template: { resource: 'errorresource' },
  metadata: {
    '/resource': [
      {
        type: cxapi.ERROR_METADATA_KEY,
        data: 'this is an error'
      }
    ]
  },
});

export = {
  async 'do not throw when selecting stack without errors'(test: Test) {
    // GIVEN
    const stacks = new AppStacks({
      configuration: new Configuration(),
      aws: new SDK(),
      synthesizer: async () => FIXED_RESULT,
    });

    // WHEN
    const selected = await stacks.selectStacks(['withouterrors'], ExtendedStackSelection.None);

    // THEN
    test.equal(selected[0].template.resource, 'noerrorresource');

    test.done();
  },

  async 'do throw when selecting stack with errors'(test: Test) {
    // GIVEN
    const stacks = new AppStacks({
      configuration: new Configuration(),
      aws: new SDK(),
      synthesizer: async () => FIXED_RESULT,
    });

    // WHEN
    try {
      await stacks.selectStacks(['witherrors'], ExtendedStackSelection.None);
      test.ok(false, 'Did not get exception');
    } catch (e) {
      test.ok(/Found errors/.test(e.toString()), 'Wrong error');
    }

    test.done();
  },

  async 'renames get applied when stacks are selected'(test: Test) {
    // GIVEN
    const stacks = new AppStacks({
      configuration: new Configuration(),
      aws: new SDK(),
      synthesizer: async () => FIXED_RESULT,
      renames: new Renames({ withouterrors: 'withoutbananas' }),
    });

    // WHEN
    const synthed = await stacks.selectStacks(['withouterrors'], ExtendedStackSelection.None);

    // THEN
    test.equal(synthed[0].name, 'withoutbananas');
    test.equal(synthed[0].originalName, 'withouterrors');

    test.done();
  },

  async 'does not return non-autoDeployed Stacks when called without any selectors'(test: Test) {
    // GIVEN
    const stacks = appStacksWith([
      {
        stackName: 'NotAutoDeployedStack',
        template: { resource: 'Resource' },
        autoDeploy: false,
      },
    ]);

    // WHEN
    const synthed = await stacks.selectStacks([], ExtendedStackSelection.None);

    // THEN
    test.equal(synthed.length, 0);

    test.done();
  },

  async 'does return non-autoDeployed Stacks when called with selectors matching it'(test: Test) {
    // GIVEN
    const stacks = appStacksWith([
      {
        stackName: 'NotAutoDeployedStack',
        template: { resource: 'Resource' },
        autoDeploy: false,
      },
    ]);

    // WHEN
    const synthed = await stacks.selectStacks(['NotAutoDeployedStack'], ExtendedStackSelection.None);

    // THEN
    test.equal(synthed.length, 1);

    test.done();
  },

  async "does return an non-autoDeployed Stack when it's a dependency of a selected Stack"(test: Test) {
    // GIVEN
    const stacks = appStacksWith([
      {
        stackName: 'NotAutoDeployedStack',
        template: { resource: 'Resource' },
        autoDeploy: false,
      },
      {
        stackName: 'AutoDeployedStack',
        autoDeploy: true,
        depends: [ 'NotAutoDeployedStack' ],
        template: { resource: 'Resource' },
      },
    ]);

    // WHEN
    const synthed = await stacks.selectStacks(['AutoDeployedStack'], ExtendedStackSelection.Upstream);

    // THEN
    test.equal(synthed.length, 2);

    test.done();
  },
};

function appStacksWith(stacks: TestStackArtifact[]): AppStacks {
  const assembly = testAssembly(...stacks);
  return new AppStacks({
    configuration: new Configuration(),
    aws: new SDK(),
    synthesizer: async () => assembly,
  });
}
