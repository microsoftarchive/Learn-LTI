using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Edna.Utils.Linq
{
    public static class CommonExtensions
    {
        public static IEnumerable<T> Do<T>(this IEnumerable<T> source, Action<T> action)
        {
            return source.Select(item =>
            {
                action(item);
                return item;
            });
        }

        public static void ForEach<T>(this IEnumerable<T> source, Action<T> action)
        {
            foreach (T item in source)
                action(item);
        }
    }
}