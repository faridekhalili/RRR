import { LogLevel } from '../enums/log-level.enum';
import { Log } from '../models/log.model';
import { logger } from '../utils/logger.util';

import { TransformationDetails } from '../models/transformation-details.model';
import * as T from '@babel/types';
import { NodePath } from '@babel/traverse';


export default function setStateToAssignmentCurrent(td: TransformationDetails): void {

  const theNode: NodePath<T.Node> = td.astNodeAfter;

  if (!theNode.isCallExpression()) {
    logger.log(
      new Log.Builder()
        .withSeverity(LogLevel.LOG)
        .withModule('transformations.setStateToAssignmentCurrent()')
        .withMessage('Expected call expression, got a ' + theNode.type)
        .build()
    );
    return;
  }

  let rhs: T.Expression;
  const lhs: T.MemberExpression = T.memberExpression(T.identifier(td.additionalInfo.varName), T.identifier('current'));

  if (T.isArrowFunctionExpression(theNode.node.arguments[0])) {
    const funcExpr: T.ArrowFunctionExpression = theNode.node.arguments[0];
    rhs = T.callExpression(funcExpr, [lhs]);
  } else {
    rhs = (<T.Expression>theNode.node.arguments[0]);
  }

  const assignmentExpression: T.AssignmentExpression = T.assignmentExpression('=', lhs, rhs);

  theNode.replaceWith(assignmentExpression);

}
