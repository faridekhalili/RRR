import { LogLevel } from '../enums/log-level.enum';
import { Log } from '../models/log.model';
import { logger } from '../utils/logger.util';

import { TransformationDetails } from '../models/transformation-details.model';
import * as T from '@babel/types';
import { NodePath } from '@babel/traverse';

export default function importPureComponent(td: TransformationDetails): void {

  const theNode: NodePath<T.Node> = td.astNodeAfter;

  if (!theNode.isProgram()) {
    logger.log(
      new Log.Builder()
        .withSeverity(LogLevel.LOG)
        .withModule('transformations.importPureComponent()')
        .withMessage('Expected program, got a ' + theNode.type)
        .build()
    );
    return;
  }

  const importSpecifiers: T.ImportSpecifier[] = [T.importSpecifier(T.identifier('PureComponent'), T.identifier('PureComponent'))];
  const pureComponentImport: T.ImportDeclaration = T.importDeclaration(importSpecifiers, T.stringLiteral('react'));
  (<T.Program>theNode.node).body.unshift(pureComponentImport);

}
