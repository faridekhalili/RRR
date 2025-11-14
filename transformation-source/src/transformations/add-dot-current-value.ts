import { LogLevel } from '../enums/log-level.enum';
import { Log } from '../models/log.model';
import { logger } from '../utils/logger.util';

import { TransformationDetails } from '../models/transformation-details.model';
import * as T from '@babel/types';
import { NodePath } from '@babel/traverse';

export default function addDotCurrentValue(td: TransformationDetails): void {

  const theNode: NodePath<T.Node> = td.astNodeAfter;

  if (!theNode.isIdentifier()) {
    logger.log(
      new Log.Builder()
        .withSeverity(LogLevel.LOG)
        .withModule('transformations.addDotCurrentValue()')
        .withMessage('Expected identifier, got a ' + theNode.type)
        .build()
    );
    return;
  }

  const variableName: string = (<T.Identifier>theNode.node).name;
  const memberExpression: T.MemberExpression = T.memberExpression(
    T.memberExpression(T.identifier(variableName), T.identifier('current')), T.identifier('value'));
  theNode.replaceWith(memberExpression);

}
