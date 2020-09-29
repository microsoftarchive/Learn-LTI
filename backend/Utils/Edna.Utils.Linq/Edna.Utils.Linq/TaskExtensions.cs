// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System.Collections.Generic;
using System.Threading.Tasks;

namespace Edna.Utils.Linq
{
    public static class TaskExtensions
    {
        public static Task<T[]> WhenAll<T>(this IEnumerable<Task<T>> source) => Task.WhenAll(source);
        public static Task WhenAll(this IEnumerable<Task> source) => Task.WhenAll(source);
    }
}
