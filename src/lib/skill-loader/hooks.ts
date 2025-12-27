/**
 * Skills React Hooks
 * 提供便捷的 React 集成
 */

'use client';

import { useState, useEffect } from 'react';
import { Skill, SkillResult } from './types';
import { getSkillRegistry, getSkillExecutor } from './index';

/**
 * 使用所有技能列表
 */
export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSkills() {
      try {
        const registry = await getSkillRegistry();
        if (mounted) {
          setSkills(registry.listAll());
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      mounted = false;
    };
  }, []);

  return { skills, loading, error };
}

/**
 * 使用单个技能
 */
export function useSkill(name: string) {
  const [skill, setSkill] = useState<Skill | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSkill() {
      try {
        const registry = await getSkillRegistry();
        const foundSkill = registry.get(name);

        if (mounted) {
          setSkill(foundSkill);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    }

    loadSkill();

    return () => {
      mounted = false;
    };
  }, [name]);

  return { skill, loading, error };
}

/**
 * 执行技能
 */
export function useSkillExecution() {
  const [result, setResult] = useState<SkillResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (skillName: string, context: any = {}) => {
    setLoading(true);
    setError(null);

    try {
      const executor = await getSkillExecutor();
      const executionResult = await executor.execute(skillName, context);

      if (executionResult.success) {
        setResult(executionResult);
      } else {
        throw new Error(executionResult.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { execute, result, loading, error, reset };
}

/**
 * 按类别获取技能
 */
export function useSkillsByCategory(category: string) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSkills() {
      try {
        const registry = await getSkillRegistry();
        const filteredSkills = registry.listByCategory(category);

        if (mounted) {
          setSkills(filteredSkills);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load skills by category:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      mounted = false;
    };
  }, [category]);

  return { skills, loading };
}
